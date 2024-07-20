const passport = require('passport'),
    localStrategy = require('passport-local').Strategy,
    models = require('./models.js'),
    passportJWT = require("passport-jwt"),
    users = models.User,
    jwtStrategy = passportJWT.Strategy,
    extractJWT = passportJWT.ExtractJwt;

passport.use(new localStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
}, async (username, password, callback) => {
    console.log(`${username} ${password}`);
    await users.findOne ({ username: username})
        .then(user => {
            if (!user) {
                console.log('incorrect username');
                return callback(null, false, {message: 'Incorrect username or password.'});
            }
            console.log('finished');
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
    secretOrKey: 'your_jwt_secret'
}, async (jwtPayload, callback) => {
    return await users.findById(jwtPayload._id)
        .then(user => callback(null, user))
        .catch(error => callback(error));
}));