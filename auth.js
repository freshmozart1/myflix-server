const jwt = require('jsonwebtoken'),
    passport = require('passport'),
    cookieParser = require('cookie-parser');

require('./passport.js');

module.exports = (router) => {
    router.use(cookieParser());
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Please provide a valid username and password.',
                    user: user
                }).end();
            }
            req.login(user, { session: false }, error => {
                if (error) {
                    res.end(error);
                } else {
                    const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
                        subject: user.username,
                        expiresIn: '7d',
                        algorithm: 'HS256'
                    })
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: true,
                        //sameSite: 'strict',
                        maxAge: 7 * 24 * 60 * 60 * 1000
                    });
                    return res.status(200).json({ user, token }).end();
                }
            });
        })(req, res);
    });
};