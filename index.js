const express = require('express'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    passport = require('passport'),
    cors = require('cors'),
    {param, matchedData, validationResult, body, checkExact} = require('express-validator'),
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
 * This helper function is a express-validator that checks if a field of a request exists in a collection of a MongoDB database.
 * @param {*} request Where to look for the field in the request
 * @param {String} field The name of the field to check
 * @param {*} collection The collection to check the field against
 * @param {String} errorMessage The error message to return if the field is not found in the collection
 * @returns {ValidationChain}
 */
function _checkFieldInCollection(request, field, collection, errorMessage) {
    return request(field, errorMessage).custom(async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id) || !(await collection.findById(id))) return Promise.reject();
        return true;
    });
}

/**
 * This helper function is a express-validator that checks if a field in a request is empty and bails out if it is empty.
 * @param {*} request Where to look for the field in the request
 * @param {String} field The field to check
 * @param {String} message The error message to return if the field is empty
 * @returns {ValidationChain}
 */
function _ifFieldEmptyBail(request, field, message, bailLevel = 'request') {
    return request(field, message).notEmpty().bail({level: bailLevel});
}

/**
 * This helper function is a express-validator that checks if the favourites field in a requests body is valid.
 * Favourites is always optional.
 * @param {String} bailLevel The level to bail out of the validation chain
 * @returns {ValidationChain}
 */
function _validateFavourites(bailLevel = 'request') {
    return body('favourites', 'Favourites must be an non empty array').isArray({ min: 1 }).bail({level: bailLevel}).optional({ values: 'falsy' }).custom(async (favourites) => {
        for (const id of favourites) {
            if (!mongoose.Types.ObjectId.isValid(id) || !(await movies.findById(id))) return Promise.reject('Invalid movie ID in favourites.');
        }
        return true;
    });
}

/**
 * This helper function is a express-validator that checks if a field in a request is a valid date.
 * @param {*} request Where to look for the field in the request
 * @param {String} field The field to check 
 * @param {String} errorMessage The error message to return if the field is not a valid date
 * @returns {ValidationChain}
 */
function _valiDate(request, field, errorMessage) { // This is a very funny name!
    return request(field, errorMessage).custom(value => {
        return !isNaN(Date.parse(value));
    });
}

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
    _checkFieldInCollection(body, 'genre', genres, 'Genre not found in database.').bail({level: 'request'}),
    _checkFieldInCollection(body, 'director', directors, 'Director not found in database.').bail({level: 'request'})
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
    body('username', 'Username is required').isLength({min: 5}).escape().bail({level: 'request'}),
    body('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric().bail({level: 'request'}),
    _ifFieldEmptyBail(body, 'email', 'Email is required'),
    body('email', 'Email does not appear to be valid').isEmail().normalizeEmail().bail({level: 'request'}),
    _ifFieldEmptyBail(body, 'password', 'Password is required'),
    _valiDate(body, 'birthday', 'Birthday is not a valid date.').bail({level: 'request'}).optional({values: 'falsy'}),
    _validateFavourites()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    const data = matchedData(req);
    await users.findOne({ username: data.username})
        .then(async (user) => { //This should be a validation middleware.
            if (user) {
                return res.status(400).send(data.username + ' already exists.');
            } else {
                users.create({
                    username: data.username,
                    password: users.hashPassword(data.password),
                    email: data.email,
                    birthday: data.birthday ? data.birthday : null,
                    favourites: data.favourites ? data.favourites : null
                }).then((user) => {
                    res.status(201).json(user);
                }).catch((err) => {
                    console.error(err);
                    res.status(500).send('Error: ' + err);
                });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * @api {delete} /users/:username Delete a user by username
 */
app.delete('/users/:username', [
    passport.authenticate('jwt', {session: false}),
    param('username', 'username_required').isLength({min: 5}).escape().bail({level: 'request'}),
    param('username', 'not_allowed').custom((value, {req}) => {
        return value === req.user.username;
    })
], async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors = errors.array();
        switch (errors[0].msg) { //This is also shit.
            case 'username_required':
                res.status(422).end('Please provide a valid username.');
                break;
            case 'not_allowed':
                res.status(403).end('You are not allowed to delete this user!');
                break;
            default:
                res.status(422).json({ errors });
        }
    } else {
        await users.deleteOne({ username: req.params.username })
        .then(result => {
            if (result.deletedCount === 0) {
                return res.status(404).send(req.params.username + ' was not found.');
            } else {
                res.status(200).send(req.params.username + ' was deleted.');
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    }
});

/**
 * @api {patch} /users/:username Update a user by username
 * @todo hash the password
 */
app.patch('/users/:username', [
    passport.authenticate('jwt', {session: false}),
    param('username', 'username_required').isLength({min: 5}).escape().bail({level: 'request'}),
    param('username', 'not_allowed').custom((value, {req}) => { //Change this to oneOf() when super users are implemented.
        return value === req.user.username;
    }).bail({level: 'request'}),
    checkExact([
        body('username', 'Username must be at least 5 characters long,').isLength({min: 5}).escape().optional({values: 'falsy'}),
        body('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric().escape().optional({values: 'falsy'}),
        body('email', 'Email does not appear to be valid').isEmail().normalizeEmail().optional({values: 'falsy'}),
        _ifFieldEmptyBail(body, 'password', 'Password can\'t be empty.').optional({values: 'falsy'}),
        _valiDate(body, 'birthday', 'Birthday is not a vaild date').bail({level: 'request'}).optional({values: 'falsy'}),
        _validateFavourites()
    ])
], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors = errors.array();
        switch (errors[0].msg) { //This is shit.
            case 'username_required':
                res.status(422).end('Please provide a valid username.');
                break;
            case 'not_allowed':
                res.status(403).end('You are not allowed to update this user!');
                break;
            default:
                res.status(422).json({ errors }).end();
        }
    } else {
        const data = matchedData(req);
        if((Object.keys(data).length === 1) && (data.username === req.user.username)) return res.status(400).send('No valid data provided.').end();
        console.log(data);
        users.findOneAndUpdate({ username: req.params.username }, data, {new: true}) //Do not use data.username here in case a super user wants to change the username of another user.
            .then(user => {
                if (!user) {
                    return res.status(404).send(req.params.username + ' was not found.');
                } else {
                    return res.status(200).send('Successfully updated user ' + req.params.username);
                }
            })
            .catch(err => {
                console.error(err);
                return res.status(500).send('Error: ' + err);
            });
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
