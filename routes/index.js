const router = require('express').Router();
const register = require('../controllers/register')
const user = require('../controllers/user')
const posts = require('../controllers/posts')

router.use(function (req, res, next) {
    if (req.user) {
        res.locals.currentUser = req.user;
        res.locals.currentUserName = req.user.username
    }
    next();
});
  
router.get('/', function (req, res, next) {
    res.render("home",{title:"home"})
});

router.get('/sign-up', register.sign_up_form) 

router.post('/sign-up', register.sign_up)

router.get('/log-in', register.get_log_in)

router.post('/log-in',register.post_log_in)

router.get('/logged-in', register.logged_in)

router.get('/home', user.home)

router.get('/post/create', posts.post_form)

router.post('/post/create', posts.submit_post)

router.post('/logout', user.log_out)

router.get('/post/:id/edit', posts.edit_post)

router.post('/post/:id/edit', posts.make_edit);

module.exports = router;
