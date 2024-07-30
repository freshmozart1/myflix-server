const express = require('express'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    passport = require('passport'),
    cors = require('cors'),
    {param, matchedData, validationResult, body, checkExact} = require('express-validator'),
    { _validateUserFieldUnchanged, _validateIdInCollection, _ifFieldEmptyBail, _validateFavouritesAndBail, _valiDate, _checkBodyEmpty, _validateUsername } = require('./helpers.js'),
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
 * @api {post} /directors Create a new director
 */
app.post('/directors', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await directors.findOne({ name: req.body.name })
        .then(director => {
            if (director) {
                return res.status(400).send(req.body.name + ' already exists.');
            } else {
                directors.create({
                    name: req.body.name,
                    birthday: req.body.birthday,
                    deathday: req.body.deathday,
                    biography: req.body.biography
                }).then(director => {
                    res.status(201).json(director);
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
});

/**
 * @api {get} /directors?:limit Get all or a limited number of directors
 */
app.get('/directors?:limit', (req, res) => {
    if (req.query.limit && /^[1-9]\d*$/.test(req.query.limit)) {
        directors.find().limit(parseInt(req.query.limit))
            .then(directors => res.status(200).json(directors))
            .catch(err => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    } else {
        directors.find()
            .then(directors => res.status(200).json(directors))
            .catch(err => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });

    }
});

/**
 * @api {get} /directors/:name Get a director by name
 */
app.get('/directors/:name', (req, res) => {
    directors.findOne({ name: req.params.name })
        .then(director => {
            if (!director) {
                return res.status(404).send(req.params.name + ' was not found.');
            }
            res.status(200).json(director);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * @api {get} /genres?:limit Get all or a limited number of genres
 */
app.get('/genres?:limit', (req, res) => {
    if (req.query.limit && /^[1-9]\d*$/.test(req.query.limit)) {
        genres.find().limit(parseInt(req.query.limit))
            .then(genres => {
                if (genres.length === 0) {
                    return res.status(404).send('No genres found.');
                }
                res.status(200).json(genres)
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    } else {
        genres.find()
            .then(genres => {
                if (genres.length === 0) {
                    return res.status(404).send('No genres found.');
                }
                res.status(200).json(genres)
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });

    }
});

/**
 * @api {get} /genres/:name Get a genre by name
 */
app.get('/genres/:name', (req, res) => {
    genres.findOne({ name: req.params.name })
        .then(genre => {
            if (!genre) {
                return res.status(404).send(req.params.name + ' was not found.');
            }
            res.status(200).json(genre);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * @api {post} /genres Create a new genre
 */
app.post('/genres',  passport.authenticate('jwt', {session: false}), (req, res) => {
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
});

/**
 * @api {get} /movies/:title Get a movie by title
 */
app.get('/movies/:title', (req, res) => {
    movies.findOne({ title: req.params.title }).populate('genre').populate('director')
        .then(movie => {
            if (!movie) {
                return res.status(404).send(req.params.title + ' was not found.');
            }
            res.status(200).json(movie);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * @api {get} /movies?:limit Get all or a limited number of movies
 */
app.get('/movies?:limit', (req, res) => {
    if (req.query.limit && /^[1-9]\d*$/.test(req.query.limit)) {
        movies.find().limit(parseInt(req.query.limit)).populate('genre').populate('director')
            .then(movies => {
                if (movies.length === 0) {
                    return res.status(404).send('No movies found.');
                }
                res.status(200).json(movies)
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });

    } else {
        movies.find().populate('genre').populate('director')
            .then(movies => {
                if (movies.length === 0) {
                    return res.status(404).send('No movies found.');
                }
                res.status(200).json(movies)
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    }
});

/**
 * @api {post} /movies Create a new movie
 */
app.post('/movies', [
    passport.authenticate('jwt', {session: false}),
    _ifFieldEmptyBail(body, 'title', 'The title is required'),
    _ifFieldEmptyBail(body, 'description', 'The description is required'),
    _ifFieldEmptyBail(body, 'genre', 'A genre ID is required'),
    _ifFieldEmptyBail(body, 'director', 'A director ID is required'),
    _ifFieldEmptyBail(body, 'imagePath', 'imagePath can\'t be empty').optional({values: 'falsy'}),
    body('title', 'Movie already exists in the database.').custom(async title => {
        if(await movies.findOne({ title })) return Promise.reject();
        return true;
    }).bail({level: 'request'}),
    _validateIdInCollection(body, 'genre', genres, 'Genre not found in database.').bail({level: 'request'}),
    _validateIdInCollection(body, 'director', directors, 'Director not found in database.').bail({level: 'request'})
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    const data = matchedData(req);
    movies.create({
        title: data.title,
        description: data.description,
        genre: data.genre,
        director: data.director,
        imagePath: data.imagePath ? data.imagePath : null
    })
        .then(movie => {
            res.status(201).json(movie);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * @api {post} /users Create a new user
 */
app.post('/users', [
    _checkBodyEmpty,
    _validateUsername(body),
    body('username').custom(async username => {
        try {
            if (await users.exists({ username })) return Promise.reject('Username already exists.');
        } catch (e) {
            return Promise.reject('Database error: ' + e);
        }
        return Promise.resolve();
    }).bail({level: 'request'}),
    _ifFieldEmptyBail(body, 'email', 'Email is required'),
    body('email', 'Email does not appear to be valid').isEmail().normalizeEmail().bail({level: 'request'}),
    _ifFieldEmptyBail(body, 'password', 'Password is required'),
    _valiDate(body, 'birthday', 'Birthday is not a valid date.').bail({level: 'request'}).optional({values: 'falsy'}),
    _validateFavouritesAndBail()
], async (req, res) => {
    try {
        validationResult(req).throw();
        const data = matchedData(req);
        await users.create({
            username: data.username,
            password: users.hashPassword(data.password),
            email: data.email,
            birthday: data.birthday ? data.birthday : null,
            favourites: data.favourites ? data.favourites : null
        });
        res.status(201).end('User ' + data.username + ' was created.');
    } catch (e) {
        if (Array.isArray(e.errors) && e.errors[0].msg) return res.status(422).end(e.errors[0].msg);
        return res.status(500).end('Database error: ' + e);
    }
});

/**
 * @api {delete} /users/:username Delete a user by username
 */
app.delete('/users/:username', [
    passport.authenticate('jwt', {session: false}),
    _validateUsername(param),
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
    _validateUsername(param),
    param('username', 'You are not allowed to update this user!').custom((value, {req}) => { //Change this to oneOf() when super users are implemented.
        return value === req.user.username;
    }).bail({level: 'request'}),
    _validateUserFieldUnchanged(body, 'username').bail({level: 'request'}).optional({values: 'falsy'}),
    _validateUsername(body).optional({values: 'falsy'}),
    _validateUserFieldUnchanged(body, 'email').bail({level: 'request'}).optional({values: 'falsy'}),
    body('email', 'Email does not appear to be valid').isEmail().bail({level: 'request'}).normalizeEmail().optional({values: 'falsy'}),
    _validateUserFieldUnchanged(body, 'password').bail({level: 'request'}).optional({values: 'falsy'}),
    _validateUserFieldUnchanged(body, 'birthday').bail({level: 'request'}).optional({values: 'falsy'}),
    _valiDate(body, 'birthday', 'Birthday is not a vaild date').bail({level: 'request'}).optional({values: 'falsy'}),
    _validateFavouritesAndBail(),
    _validateUserFieldUnchanged(body, 'favourites').bail({level: 'request'}).optional({values: 'falsy'}),
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

app.post('/test', [
    body().custom(value => {
        if ((Object.keys(value).length === 1) && (value.test === 'freshmozart')) return Promise.reject('No valid data provided.');
        return true;
    })
], (req, res) => {
    try {
        validationResult(req).throw();
        res.status(200).send('Success');
    } catch (e) {
        switch (e.type) {
            case 'field':
                res.status(422).json({ errors: e.errors });
                break;
            default:
                console.error(e.errors);
                res.status(500).send('Error: ' + e);
        }
    }
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
