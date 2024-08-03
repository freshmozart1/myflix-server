const express = require('express'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    passport = require('passport'),
    cors = require('cors'),
    {param, matchedData, validationResult, body, checkExact, query} = require('express-validator'),
    {
        _validateFieldUnchanged,
        _validateIdInCollection,
        _valiDate,
        _checkBodyEmpty,
        _validateUsername,
        _getDocuments,
        _createDocument,
        _dynamicRouteValidation
    } = require('./helpers.js'),
    models = require('./models.js'),
    auth = require('./auth.js'),
    app = express(),
    movies = models.movie,
    users = models.user,
    directors = models.director,
    genres = models.genre;

mongoose.connect(process.env.CONNECTION_URI);

/**
 * @todo Fix this. CORS should not allow access from everywhere.
 */
app.use(cors());
app.use(morgan('common'));
app.use(express.static(__dirname));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

auth(app);
require('./passport.js');

/**
 * @api {get} /directors/:name?limit Get all, a limited number or a specific director by name
 * @api {get} /genres/:name?limit Get all, a limited number or a specific genre by name
 * @api {get} /movies/:title?limit Get all, a limited number or a specific movie by title
 */

app.get(['/directors/:name?', '/genres/:name?', '/movies/:title?'], [
    param('name').optional({values: 'falsy'}),
    param('title').optional({values: 'falsy'}),
    query('limit').optional({values: 'falsy'}).isInt({gt: 0}),
    checkExact([], {message: 'Request contains unknown fields.'})
], (req, res) => {
    const path = req.path.split('/')[1];
    if (path === 'directors') {
        _getDocuments(req, res, directors);
    } else if (path === 'genres') {
        _getDocuments(req, res, genres);
    }
    else if (path === 'movies') {
        _getDocuments(req, res, movies);
    }
});

/*app.post('/genres',  passport.authenticate('jwt', {session: false}), (req, res) => {
    genres.findOne({ name: req.body.name })
        .then(genre => {
            if (genre) {
                return res.status(400).send(req.body.name + ' already exists.');
            } else {
                genres.create({
                    name: req.body.name,
                    description: req.body.description
                }).then(genre => {
                    res.status(201).json(genre);
                }).catch(err => {
                    console.error(err);
                    res.status(500).send('Error: ' + err);
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});*/

app.post(['/directors', '/genres', '/movies', '/users'], [
    passport.authenticate('jwt', {session: false}),
    _checkBodyEmpty,
    _dynamicRouteValidation
], (req, res) => {
    if (req.path === '/directors') {
        _createDocument(req, res, directors);
    } else if (req.path === '/genres') {
        _createDocument(req, res, genres);
    } else if (req.path === '/movies') {
        _createDocument(req, res, movies);
    } else if (req.path === '/users') {
        _createDocument(req, res, users);
    }
});

/**
 * @api {delete} /users/:username Delete a user by username
 */
app.delete('/users/:username', [
    passport.authenticate('jwt', {session: false}),
    _validateUsername(param).bail({ level: 'request' }),
    param('username', 'not_allowed').custom((value, {req}) => {
        return value === req.user.username;
    })
], async (req, res) => {
    try {
        validationResult(req).throw();
        const data = matchedData(req);
        if((await users.deleteOne({username: data.username})).deletedCount === 0) return res.status(404).end(data.username + ' wasn\'t found.');
        res.status(200).end(req.params.username + ' was deleted.');
    } catch (e) {
        if (Array.isArray(e.errors) && e.errors[0].msg) return res.status(422).end(e.errors[0].msg);
        return res.status(500).end('Database error: ' + e);
    }
});

/**
 * @api {patch} /users/:username Update a user by username
 */
app.patch('/users/:username', [
    passport.authenticate('jwt', {session: false}),
    _checkBodyEmpty,
    _validateUsername(param).bail({ level: 'request' }),
    param('username', 'You are not allowed to update this user!').custom((value, {req}) => { //Change this to oneOf() when super users are implemented.
        return value === req.user.username;
    }).bail({level: 'request'}),
    _validateFieldUnchanged(body, 'username').bail({level: 'request'}).optional({values: 'falsy'}),
    _validateUsername(body).bail({ level: 'request' }).optional({values: 'falsy'}),
    _validateFieldUnchanged(body, 'email').bail({level: 'request'}).optional({values: 'falsy'}),
    body('email', 'Email does not appear to be valid').isEmail().bail({level: 'request'}).normalizeEmail().optional({values: 'falsy'}),
    _validateFieldUnchanged(body, 'password').bail({level: 'request'}).optional({values: 'falsy'}),
    _validateFieldUnchanged(body, 'birthday').bail({level: 'request'}).optional({values: 'falsy'}),
    _valiDate(body, 'birthday', 'Birthday is not a vaild date').bail({level: 'request'}).optional({values: 'falsy'}),
    _validateFieldUnchanged(body, 'favourites').bail({level: 'request'}).optional({values: 'falsy'}),
    _validateIdInCollection(body, 'favourites', movies, 'Invalid movie ID in favourites.').bail({level: 'request'}).optional({values: 'falsy'}),
    checkExact([], {message: 'Request body contains unknown fields.'})
], async (req, res) => {
    try {
        validationResult(req).throw();
        const data = matchedData(req);
        if (data.password) data.password = users.hashPassword(data.password);
        if ((await users.updateOne({ username: req.params.username }, data)).modifiedCount === 0 ) return res.status(404).end(req.params.username + ' was not found.');
        res.status(200).end('Successfully updated user ' + req.params.username);
    } catch (e) {
        if (Array.isArray(e.errors) && e.errors[0].msg) return res.status(422).end(e.errors[0].msg);
        res.status(500).end('Database error: ' + e);
    }
});

app.get('/test', (req, res) => {
    res.status(200).end(movies.modelName);
});

app.use(methodOverride());
app.use((err, _, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
    next();
});

const port = process.env.PORT || 8000;

app.listen(port, '0.0.0.0', () => {
    console.log('Listening on port ' + port);
});
