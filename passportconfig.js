const LocalStrategy = require("passport-local").Strategy
const User = require('./models/user');
const bcrypt = require('bcryptjs');



const passportInit = (passport) => {
    const localStrat = new LocalStrategy(
        function (username, password, done) {
            User.findOne({ username: username.toLowerCase() }, (err, user) => {
                console.log('user search over')
                if (err) {
                    console.log('error')
                    return done(err);
                };
                if (!user) {
                    console.log('no such user')
                    return done(null, false, { message: "Incorrect username" });
                }
                
                bcrypt.compare(password, user.password, (error, res) => {
                    console.log('comparing passwords')
                    if (res) {
                        return done(null, user)
                    } else {
                        return done(null, false, { message: "Invalid username or password"  })
                    }
                })
            })
        }
    )
    passport.use(localStrat); //pass the strategy defined above to passport
    
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};

module.exports = passportInit;