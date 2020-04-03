const { body, validationResult,sanitize } = require('express-validator');
const Post = require('../models/post')
const User = require('../models/user')

exports.post_form = function (req, res, next) {
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
                console.log(user)
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
//exports.create_post