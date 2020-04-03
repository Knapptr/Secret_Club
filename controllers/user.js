const Post = require('../models/post')
const User = require('../models/user')

exports.home = function (req, res, next) {
    Post.find({}, function (err, posts) {
        console.log(posts)
        if (err) { return next(err) }
        if (!posts) { return res.render('home') }
        res.render("home",{title:"home",posts:posts})
    }).populate('user')
}
exports.log_out = function (req, res, next) {
    req.logout();
    res.redirect('/log-in')
}