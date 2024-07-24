const express = require('express'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    passport = require('passport'),
    cors = require('cors'),
    {check, matchedData, validationResult} = require('express-validator'),
    models = require('./models.js'),
    auth = require('./auth.js'),
    app = express(),
    movies = models.movie,
    users = models.user,
    directors = models.director,
    genres = models.genre;

mongoose.connect(process.env.CONNECTION_URI);

// const allowedOrigins = ['http://localhost:8080'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        //if (allowedOrigins.indexOf(origin) === -1) return  callback(new Error('CORS doesn\'t allow access from origin ' + origin), false);
        return callback(null, true);
    }
}));
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
app.post('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
    movies.findOne({ title: req.body.title })
        .then(movie => {
            if (movie) {
                return res.status(400).send(req.body.title + ' already exists.');
            } else {
                directors.findById(req.body.director)
                    .then(director => {
                        if (!director) {
                            return res.status(404).send('Director not found.');
                        } else {
                            genres.findById(req.body.genre)
                                .then(genre => {
                                    if (!genre) {
                                        return res.status(404).send('Genre not found.');
                                    } else {
                                        movies.create({
                                            title: req.body.title,
                                            description: req.body.description,
                                            director: director,
                                            genre: genre,
                                            imagePath: req.body.imagePath
                                        }).then(movie => {
                                            res.status(201).json(movie);
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
                        }
                    })
                    .catch(err => {
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
 * @api {post} /users Create a new user
 */
app.post('/users', [
    check('username', 'Username is required').isLength({min: 5}).escape(),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('email', 'email can\'t be empty').notEmpty(),
    check('email', 'Email does not appear to be valid').isEmail().normalizeEmail(),
    check('password', 'Password is required').notEmpty(),
    check('birthday', 'Birthday must be a date').optional({checkFalsy: true}).isDate(),
    check('favourites', 'Favourites must be an array').optional({checkFalsy: true}).isArray({min: 1})
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    const data = matchedData(req);
    await users.findOne({ username: data.username})
        .then(async (user) => {
            if (user) {
                return res.status(400).send(data.username + ' already exists.');
            }
            if(data.favourites && ((await movies.find({_id: {$in: data.favourites}})).length !== data.favourites.length)) {
                return res.status(404).send('One or more of the movies in the favourites list could not be found.');
            } else {
                users.create({
                    username: data.username,
                    password: users.hashPassword(data.password),
                    email: data.email,
                    birthday: data.birthday ? data.birthday : null,
                    favourites: data.favourites ? data.favourites : []
                }).then((user) => {
                    res.status(201).json(user);
                }).catch((err) => {
                    console.error(err);
                    res.status(500).send('Error: ' + err);
                });
            }
        }).catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * @api {delete} /users/:username Delete a user by username
 */
app.delete('/users/:username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    if (req.user.username !== req.params.username) {
        return res.status(403).send('You are not allowed to delete this user.');
    }
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
});

/**
 * This function checks if there are common keys between a request body and a mongoose schema
 * 
 * @param {Array} body 
 * @param {Object} schema 
 * @returns an object with key-value-pairs that are common between the body and the schema, or false if there are none
 */
function _hasCommonKeyValuePairs(body, schema) {
    const bodyKeys = Object.keys(body);
    const schemaSet = new Set(Object.keys(schema.paths));
    const commonKeyValuePairs = {};
    let hasCommonKeys = false;
    for (const key of bodyKeys) {
        if (schemaSet.has(key)) {
            commonKeyValuePairs[key] = body[key];
            hasCommonKeys = true;
        }
    }
    return hasCommonKeys ? commonKeyValuePairs : false;
}

/**
 * @api {patch} /users/:username Update a user by username
 */
app.patch('/users/:username', passport.authenticate('jwt', {session: false}), (req, res) => {
    const commonKeyValuePairs = _hasCommonKeyValuePairs(req.body, users.schema);
    if (!commonKeyValuePairs) {
        return res.status(400).send('No keys in the requests body match the databases schema.').end();
    } else if (req.user.username !== req.params.username) {
        return res.status(403).send('You are not allowed to update this user.').end();
    } else {
        users.findOneAndUpdate({ username: req.params.username}, commonKeyValuePairs, { new: true })
                .then(user => {
                    if (!user) {
                        return res.status(404).send(req.params.username + ' was not found.').end();
                    } else {
                        return res.status(200).send('Successfully updated user '+req.params.username).end();
                    }
                })
                .catch(err => {
                    console.error(err);
                    return res.status(500).send('Error: ' + err).end();
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