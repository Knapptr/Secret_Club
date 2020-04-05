const { body, validationResult, sanitize } = require('express-validator');

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
exports.membership_post = [
    body("secret", "Sorry. Maybe you're not ready").trim().equals(process.env.CLUB_PW || process.env.CLUBADMIN_PW),
    
    (req, res, next) => {

       


        let errors = validationResult(req)

        if (!errors.isEmpty()) {
           return res.render('innerCircle',{ title: "Join Us.", errors: errors.array()})
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
]

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