
function bouncer(req, res, next) {
    if (req.url !== '/log-in' && req.url!== '/sign-up') {
        if (req.user) {
            return next();
        } else {
            return res.redirect('/log-in')
        }
    }
    if (req.url == '/log-in' && req.user || req.url == '/sign-up' && req.user) {
        return res.redirect('/home')
    }
    next();
}

module.exports = bouncer;