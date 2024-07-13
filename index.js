const express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    models = require('./models.js'),
    movies = models.movie,
    users = models.user,
    directors = models.director,
    genres = models.genre,
    morgan = require('morgan'),
    methodOverride = require('method-override');

mongoose.connect('mongodb://localhost:27017/myflix');

app.use(morgan('common'));
app.use(express.static(__dirname));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

/**
 * @api {post} /directors Create a new director
 */
app.post('/directors', async (req, res) => {
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
app.post('/genres', (req, res) => {
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

});

/**
 * @api {get} /movies?:limit Get all or a limited number of movies
 */
app.get('/movies?:limit', (req, res) => {

});

/**
 * @api {post} /movies Create a new movie
 */
app.post('/movies', (req, res) => {
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
app.post('/users', async (req, res) => {
    await users.findOne({ username: req.body.username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.username + ' already exists.');
            } else {
                users.create({
                    username: req.body.username,
                    password: req.body.password,
                    email: req.body.email,
                    birthday: req.body.birthday
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

app.get('/users', async (req, res) => {
    await users.find()
        .then(users => {
            if (users.length === 0) {
                return res.status(404).send('No users found.');
            }
            res.status(201).json(users)
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * @api {get} /users/:username Get a user by username
 */
app.get('/users/:username', async (req, res) => {
    await users.findOne({ username: req.params.username })
        .then(user => {
            if (!user) {
                return res.status(404).send(req.params.username + ' was not found.');
            }
            res.status(200).json(user);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * @api {delete} /users/:username Delete a user by username
 */
app.delete('/users/:username', async (req, res) => {
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
 * @api {patch} /users/:username Update a user by username
 */
app.patch('/users/:username', (req, res) => {

});

app.use(methodOverride());
app.use((err, _, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
    next();
});

app.listen(8000, () => {
    console.log('Your app is listening on port 8000.');
});