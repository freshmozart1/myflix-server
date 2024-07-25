const passport = require('passport'),
    localStrategy = require('passport-local').Strategy,
    models = require('./models.js'),
    passportJWT = require("passport-jwt"),
    users = models.user,
    jwtStrategy = passportJWT.Strategy,
    extractJWT = passportJWT.ExtractJwt;

passport.use(new localStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, callback) => {
    await users.findOne ({ username: username})
        .then(user => {
            if (!user) {
                return callback(null, false, {message: 'Incorrect username'});
            }
            if (!user.validatePassword(password)) {
                return callback(null, false, {message: 'Incorrect password'});
            }
            return callback(null, user);
        })
        .catch(error => {
            if (error) {
                console.log(error);
                return callback(error);
            }
        });
}));

passport.use(new jwtStrategy({
    jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}, async (jwtPayload, callback) => {
    return await users.findById(jwtPayload._id)
        .then(user => callback(null, user))
        .catch(error => callback(error));
}));