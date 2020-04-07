const { body, validationResult, sanitize } = require('express-validator');
const async = require('async');

const Post = require('../models/post')
const User = require('../models/user')

exports.home = function (req, res, next) {
    Post.find({}, function (err, posts) {
        if (err) { return next(err) }
        if (!posts) { return res.render('home') }
        res.render("home",{title:"home",posts:posts})
    }).populate('user')
}
exports.log_out = function (req, res, next) {
    req.logout();
    res.redirect('/log-in')
}
exports.membership = function (req, res, next) {
    res.render('innerCircle',{title:"Join Us."})

}
exports.membership_post = function(req, res, next){

       
    if (req.body.secret !== process.env.CLUBADMIN_PW && req.body.secret !== process.env.CLUB_PW) {
        return res.render("innerCircle",{title:"Join Us.",errors:[{msg:"Perhaps you're not ready."}]})
    }

        const membershipChanges = {
            innerCircle: true,
        }

        if (req.body.secret === process.env.CLUBADMIN_PW) {
            membershipChanges.admin = true;
        }
        
        User.findByIdAndUpdate(req.user._id,membershipChanges).exec(function (err, user) {
        
            if (err) { return next(err) };
            if (!user) {
                let noUser = new Error;
                noUser.status = 404;
                return next(noUser);
            }
            res.redirect('/home')

        })
    }

exports.user_posts = [
    (req, res, next) => {
        if (!req.user.innerCircle) {
            return res.redirect('/home')
        }
        next()
    },
    (req, res, next) => {
        User.findById(req.params.id).populate({path:"posts",populate:{path:"user"}}).exec(function (err, user) {
            if (err) { return next(err) };
            if (!user) {
                let noUser = new Error("User not Found");
                noUser.status = 404
                return next(noUser)
            }
            if (user.posts.length <= 0) {
                return res.render('home',{message:"No posts found"})
            }
            
            res.render('home',{title:`${user.username}'s posts`,posts:user.posts})
        })
    }
]
exports.profile = function (req, res, next) {

    if ((!req.user.innerCircle)&&(req.params.id.toString()!==req.user._id.toString())) {
        return res.redirect(`/user/${req.user._id}`)
    }
    User.findById(req.params.id).populate('posts').exec(function (err, user) {
        if (err) { return next(err) };
        if (!user) { let noUser = new Error("User not found").status = 404; return next(noUser) };
        
        res.render('profile',{title:user.username + "'s Profile",user:user})
    })
}

exports.admin = function (req, res, next) {
    if (!req.user.admin) {
        return res.redirect('/home');
    }
    User.find({}).populate('posts').exec(function (err, users) {
        if (err) { return next(err); }
        if (!users) { let noUsers = new Error('no users!').status = 404; return next(noUsers) };
        res.render("admin_dash",{title:"Admin dashboard",users:users})
    })
}
exports.inner_circle_list = function (req, res, next) {
    User.find({innerCircle:true}, function (err, users) {
        if (err) { return next(err) }
        if (!users) { return next(new Error('Users not found').status = 404); }
        res.render('inner_circle_members',{title:"Inner circle list",users:users})
    })
}

exports.update_status = function (req, res, next) {
    if (!req.user.admin) {
        res.redirect("/home")
    }
    let membershipChange = {
        innerCircle: false,
        admin: false
    }
    if (req.body.membershipState === "admin") {
        membershipChange.innerCircle = true;
        membershipChange.admin = true;
    } else if (req.body.membershipState === "innerCircle") {
        membershipChange.innerCircle = true;
        membershipChange.admin = false;
    }
    User.findByIdAndUpdate(req.body.userID, membershipChange, function (err, success) {
        if (err) { return next(err) }
        return res.redirect('/admin')
    })
}
exports.delete_confirm = function (req, res, next) {
    if (!req.user.admin) {
        return res.redirect('/home');
    }
    User.findById(req.params.id).populate('posts').exec(function (err, user) {
        if (err) { return next(err) };
        if (!user) { let noUser = new Error('User not found').status = 404; return next(noUser) };
        res.render('user_delete',{title:"Delete User",user:user})
    })
}
exports.delete_user = function (req, res, next) {
    if (!req.user.admin) {
        return res.redirect("/home")
    }
    async.series([
        function (callback) {
            Post.deleteMany({ user: req.body.userID }, callback)
        },
        function (callback) {
            User.findByIdAndDelete(req.body.userID,callback)
        }],
        function (err, success) {
            if (err) { return next(err); }
            console.log('User and posts deleted');
            res.redirect('/admin')
        })
}
exports.edit_UN = function(req, res, next){
    if (req.user._id.toString() !== req.params.id.toString()) {
        return res.redirect('/home');
    };
    res.render('edit_UN',{title:"Change Username"})
}
exports.set_UN = [
    (req, res, next) => {
        if (req.user.id !== req.params.id) {
            return res.redirect('/home');
        }
        next();
    },
    body('username').trim().isAlphanumeric().withMessage("username must only contain letters or numbers").isLength({ min: 4, max: 15 }).withMessage('username must be between 4 and 15 characters'),
    sanitize('username').trim().escape(),

    (req, res, next) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('edit_UN',{title:"Change Username",errors:errors.array()})
        };
        User.findByIdAndUpdate(req.user._id, { username: req.body.username }, function (err, success) {
            if (err) { return next(err) };
            res.redirect(`/user/${req.user._id}/`);
        })
    }
]