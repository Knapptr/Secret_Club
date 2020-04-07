const { body, validationResult,sanitize } = require('express-validator');
const Post = require('../models/post')
const User = require('../models/user')

exports.post_form = function (req, res, next) {
    if (!req.user.innerCircle) {
        return res.redirect('/home')
    }
    res.render('post_form');
}
exports.submit_post = [
    body('title', 'Title required, and must be less than 20 characters').trim().isLength({ min: 1, max: 20 }),
    body('post', 'Post required, and must be 144 characters or less').trim().isLength({ min: 1, max: 144 }),
    sanitize("title").trim().escape(),
    sanitize('post').trim().escape(),
    (req, res, next) => {
        let newPost = new Post({
            user: req.user._id,
            title: req.body.title,
            post: req.body.post
        })
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('post_form',{title:"Create Post",post:newPost,errors:errors.array()})
        }
        newPost.save(function (err, post) {
            if (err) { return next(err) };
            User.findById(req.user._id, function (err, user) {
                if (err) { return next(err) }
                user.posts.push(post._id)
                user.save(function (err, savedUsr) {
                    if (err) {return next(err) };
                    return res.redirect('/home')
                })
                
            })
            
        })
    }
]

exports.edit_post = function (req, res, next) {
    if (!req.user.innerCircle) {
        return res.redirect('/home')
    }

    Post.findById(req.params.id, function (err, post) {
        if (post.user._id.toString() !== req.user._id.toString()) {
            return res.redirect('/home')
        }
        if (err) { return next(err) };
        return res.render('post_form',{title:"Edit Post",post:post})
    }).populate('user')
}

exports.make_edit = [
    body('title', 'Title required, and must be less than 20 characters').trim().isLength({ min: 1, max: 20 }),
    body('post', 'Post required, and must be 144 characters or less').trim().isLength({ min: 1, max: 144 }),
    sanitize('title').trim().escape(),
    sanitize('post').trim().escape(),

    (req, res, next) => {
        let errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.render('post_form', { title: "Edit Post", post: { title: req.body.title, post: req.body.post }, errors: errors.array() })
        }
        Post.findByIdAndUpdate(req.params.id, { title: req.body.title, post: req.body.post }, function (err, saved) {
            if (err) { return next(err) }
            res.redirect('/home')
        })
    }
]
exports.delete_confirm = function (req, res, next) {
    
    Post.findById(req.params.id).populate('user').exec(function (err, post) {
        if (err) { return next(err) };
        if (!post) {
            let noPost = new Error("post not found")
            noPost.status = 404
            return next(noPost);
        }
        User.findById(post.user).exec(function (err, user) {
            if (err) { return next(err) }
            if (!user) { return next(new Error('User not found').status = 404) };
            user.posts.splice(user.posts.indexOf(post._id), 1);
            user.save();
    
    })
        
        if (req.user._id.toString() !== post.user._id.toString() && !req.user.admin) {
            console.log('Unauthorized delete attempt')
            return res.redirect('/home')
        }
        res.render('post_delete',{title:"Delete post",post:post})
    })
}
exports.delete = function (req, res, next) {
    Post.findById(req.body.postID).populate('user').exec(function (err, post) {
        if (err) { return next(err) };
        if (req.user.admin || req.user._id.toString() === post.user._id.toString()) {
            Post.findByIdAndDelete(req.body.postID, function (err, success) {
                if (err) { return next(err) }
                console.log('Post deleted');
                return res.redirect('/home')
            })
        } else {
            console.log('Unauthorized delete attempt')
            return res.redirect('/home')
        }
    })
    
}
//exports.create_post