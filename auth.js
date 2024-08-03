const jwt = require('jsonwebtoken'),
    passport = require('passport');
    
require('./passport.js');

module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', {session: false}, (error, user) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Please provide a valid username and password.',
                    user: user
                }).end();
            }
            req.login(user, {session: false}, error => {
                if (error) {
                    res.send(error);
                } else {
                    const token = (user => {
                        return jwt.sign(user, process.env.JWT_SECRET, {
                            subject: user.username,
                            expiresIn: '7d',
                            algorithm: 'HS256'
                        });
                    })(user.toJSON());
                    return res.json({user, token}).end();
                }
            });
        })(req, res);
    });
};