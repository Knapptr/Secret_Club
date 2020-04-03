const { body, validationResult, sanitize } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const passport = require('passport');
const initPassport = require('../passportconfig');
initPassport(passport);



exports.sign_up_form = function (req, res, next) {
    res.render("sign_up", { title: "Sign Up"});
}

exports.sign_up = [
    (req, res, next) => {
        req.body.firstName = req.body.firstName.toLowerCase();
        req.body.lastName = req.body.lastName.toLowerCase();
        req.body.username = req.body.username.toLowerCase();

        next();  
    },
    body('password').trim().isLength({ min: 7, max: 50 }).withMessage("password must be between 7 & 50 characters").isAlphanumeric().withMessage("password may only contain letters or numbers"),
    body('username').trim().isAlphanumeric().withMessage("username must only contain letters or numbers").isLength({ min: 4, max: 15 }).withMessage('username must be between 4 and 15 characters'),
    body('firstName').trim().isAlphanumeric().withMessage("first name must only contain letters or numbers").isLength({ min: 1, max: 20 }).withMessage('first name must be between 1 and 20 characters'),
    body('lastName').trim().isAlphanumeric().withMessage("last name must only contain letters or numbers").isLength({ min: 1, max: 20 }).withMessage('last name must be between 1 and 20 characters'),
    body('username').custom(username => {
        return User.findOne({ username: username }).then(user => {
            if (user) {
                return Promise.reject('Username already in use. Choose another')
            }
        })
    }),
    body('confirmPassword', 'passwords must match').custom((confirmation,{req}) => {
       return confirmation === req.body.password
    }),
    ///sanitize
    sanitize('userName').trim().escape(),
    sanitize('password').trim(),
    sanitize('firstName').trim().escape(),
    sanitize('lastName').trim().escape(),
    
    //check validation, encrypt, process
    (req, res, next) => {
        let errors = validationResult(req);
        
        let newUser = new User({                 ///password is not assigned here-its not encrypted yet
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            username: req.body.username,
            
        })

        if (!errors.isEmpty()) {
            return res.render("sign_up",{title:"Sign Up",user:newUser,errors:errors.array()})
        }
        bcrypt.hash(req.body.password, 10, function (err, cryptPW) {
            if (err) { return next(err) };
            newUser.password = cryptPW;
            newUser.save(function (error, result) {
                if (error) { return next(error) }
                res.render('signed_up', {title:'Thanks for signing up!',signedUp:result})
            })
        })
    }

]

exports.get_log_in = function (req, res, next) {
    const flashErr = req.flash().error
    const errors = []
    if (flashErr !== undefined ){
        for (let i = 0; i < flashErr.length; i++) {
            errors.push({ msg: flashErr[i] });
        }
    }
    res.render("log_in", {title:"log in",errors: errors})
}
exports.post_log_in = [
    (req, res, next) => {
   
        next()
    },
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/log-in',
        failureFlash: true
    }),
]

exports.logged_in = function (req, res, next) {
    console.log( 'logged in req body: ' + req.body);
    console.log(req.user);
    res.send('logged in')
}
    

