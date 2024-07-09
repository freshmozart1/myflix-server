const express = require('express'),
    app = express(),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    lodash = require('lodash'),
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, email TEXT, password TEXT, birthday TEXT, favourites TEXT)');
    db.run('CREATE table genres (id INTEGER PRIMARY KEY, name TEXT, description TEXT)');
    db.run('CREATE table directors (id INTEGER PRIMARY KEY, name, birthday TEXT, deathday TEXT, biography TEXT)');
    db.run('CREATE TABLE movies (id INTEGER PRIMARY KEY, title TEXT, description TEXT, genre INTEGER, director INTEGER, image TEXT, FOREIGN KEY(genre) REFERENCES genres(id), FOREIGN KEY(director) REFERENCES directors(id))');
});

app.use(morgan('common'));
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

/**
 * @api {post} /directors Create a new director
 */
app.post('/directors', (req, res) => {
    db.get('SELECT count(name) FROM directors WHERE name = ?', req.body.name, (err, row) => {
        if (err) throw err;
        if (row['count(name)'] > 0) {
            res.status(409).send('Director already exists.').end();
        } else {
            db.run('INSERT INTO directors VALUES (NULL, ?, ?, ?, ?)', [req.body.name, req.body.birthday, req.body.deathday, req.body.biography], (err) => {
                if (err) throw err;
                res.status(201).send('Director successfully created.').end();
            });
        }
    });
});

/**
 * @api {get} /directors?:limit Get all or a limited number of directors
 */
app.get('/directors?:limit', (req, res) => {
    const limit = Number(req.query['limit']);
    if (lodash.isNumber(limit) && limit > 0) {
        db.all('SELECT * FROM directors LIMIT ?', limit, (err, directors) => {
            if (err) throw err;
            res.status(200).json({ "directors": directors }).end();
        });
    } else {
        db.all('SELECT * FROM directors', (err, directors) => {
            if (err) throw err;
            res.status(200).json({ "directors": directors }).end();
        });
    }
});

/**
 * @api {get} /directors/:name Get a director by name
 */
app.get('/directors/:name', (req, res) => {
    db.get('SELECT * FROM directors WHERE name = ?', req.params.name, (err, row) => {
        if (err) throw err;
        if (row) {
            res.status(200).json(row).end();
        } else {
            res.status(404).send(`The director ${req.params.name} does not exist.`).end();
        }
    });
});

/**
 * @api {get} /genres?:limit Get all or a limited number of genres
 */
app.get('/genres?:limit', (req, res) => {
    const limit = Number(req.query['limit']);
    if (lodash.isNumber(limit) && limit > 0) {
        db.all('SELECT * FROM genres LIMIT ?', limit, (err, names) => {
            if (err) throw err;
            res.status(200).json({ "genres": names }).end();
        });
    } else {
        db.all('SELECT * FROM genres', (err, names) => {
            if (err) throw err;
            res.status(200).json({ "genres": names }).end();
        });
    }
});

/**
 * @api {get} /genres/:name Get a genre by name
 */
app.get('/genres/:name', (req, res) => {
    db.get('SELECT * FROM genres WHERE name = ?', req.params.name, (err, row) => {
        if (err) throw err;
        if (row) {
            res.status(200).json(row).end();
        } else {
            res.status(404).send(`The genre ${req.params.name} does not exist.`).end();
        }
    });
});

/**
 * @api {post} /genres Create a new genre
 */
app.post('/genres', (req, res) => {
    db.get('SELECT count(name) FROM genres WHERE name = ?', req.body.name, (err, row) => {
        if (err) throw err;
        if (row['count(name)'] > 0) {
            res.status(409).send(`The genre already ${req.body.name} exists.`).end();
        } else {
            db.run('INSERT INTO genres VALUES (NULL, ?, ?)', [req.body.name, req.body.description], (err) => {
                if (err) throw err;
                res.sendStatus(201).end();
            });
        }
    });
});

/**
 * @api {get} /movies/:title Get a movie by title
 */
app.get('/movies/:title', (req, res) => {
    db.get('SELECT * FROM movies WHERE title = ?', req.params.title, (err, row) => {
        if (err) throw err;
        if (row) {
            db.serialize(() => {
                db.get('SELECT genres.name FROM genres INNER JOIN movies ON genres.id=movies.genre', (err, genreRow) => {
                    if (err) throw err;
                    row.genre = genreRow.name;
                });
                db.get('SELECT directors.name FROM directors INNER JOIN movies ON directors.id=movies.director', (err, directorRow) => {
                    if (err) throw err;
                    row.director = directorRow.name;
                    res.status(200).json(row).end();
                });
            });
        } else {
            res.status(404).send(`Movie ${req.params.title} doesn't exist.`).end();
        }
    });
});

/**
 * @api {get} /movies?:limit Get all or a limited number of movies
 */
app.get('/movies?:limit', (req, res) => {
    const limit = Number(req.query['limit']);
    if (lodash.isNumber(limit) && limit > 0) {
        db.all('SELECT * FROM movies LIMIT ?', limit, (err, rows) => {
            if (err) throw err;
            res.status(200).json({ "movies": rows }).end();
        });
    } else {
        db.all('SELECT * FROM movies', (err, movies) => {
            if (err) throw err;
            res.status(200).json({ "movies": movies }).end();
        });
    }
});

/**
 * @api {post} /movies Create a new movie
 */
app.post('/movies', (req, res) => {
    const genreId = Number(req.body.genre);
    const directorId = Number(req.body.director);
    if (lodash.isNaN(genreId)) {
        res.status(400).send('The genre ID must be a number').end();
        return;
    }
    if (lodash.isNaN(directorId)) {
        res.status(400).send('The director ID must be a number').end();
        return;
    }
    db.get('SELECT count(title) FROM movies WHERE title = ?', req.body.title, (err, title) => {
        if (err) throw err;
        if (title['count(title)'] > 0) {
            res.status(409).send('Movie already exists in database').end();
            return;
        } else {
            db.get('SELECT count(id) FROM genres WHERE id = ?', genreId, (err, genre) => {
                if (err) throw err;
                if (genre['count(id)'] === 0) {
                    res.status(404).send(`No genre with id ${genreId}`).end();
                    return;
                } else {
                    db.get('SELECT count(id) FROM directors WHERE id = ?', directorId, (err, director) => {
                        if (err) throw err;
                        if (director['count(id)'] === 0) {
                            res.status(404).send(`No director with id ${directorId}`).end();
                            return;
                        } else {
                            db.run('INSERT INTO movies VALUES (NULL, ?, ?, ?, ?, ?)', [req.body.title, req.body.description, genreId, directorId, req.body.image], (err) => {
                                if (err) throw err;
                                res.status(201).send(`Movie ${req.body.title} was successfully added to the database.`).end();
                                return;
                            });
                        }
                    });
                }
            });
        }
    });
});

/**
 * @api {post} /users Create a new user
 */
app.post('/users', (req, res) => {
    const username = req.body.username,
        email = req.body.email,
        password = req.body.password,
        birthday = req.body.birthday,
        favourites = req.body.favourites;
    if (!username || !email || !password || typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        res.status(400).send('The request body must contain a JSON object with the keys username, email and passsword. All these params must be of type string').end();
        return;
    }
    db.get('SELECT count(*) FROM users WHERE username = ?', username, (err, userCountRow) => {
        if (err) throw err;
        if (userCountRow['count(*)'] > 0) {
            res.status(409).send(`A user with the name ${username} already exists.`).end();
            return;
        } else if ((birthday && typeof birthday !== 'string') || (favourites && !lodash.isArray(favourites))) {
            res.status(400).send('Birthday param must be of type string. Favourites param must be of type array.').end();
            return;
        } else if (favourites) {
            db.all(`SELECT id FROM movies WHERE id IN (${favourites.join(',')})`, (err, rows) => {
                if (err) throw err;
                const movieIds = rows.map(row => row.id);
                const missingIds = favourites.filter(id => !movieIds.includes(id));
                if (missingIds.length > 0) {
                    res.status(400).send('Favourites array contains invalid movie ids.').end();
                } else {
                    db.run('INSERT INTO users VALUES (NULL, ?, ?, ?, ?, ?)', [req.body.username, req.body.email, req.body.password, req.body.birthday, '[' + favourites.join(', ') + ']']);
                    res.status(201).send('User successfully created').end();
                }
            });
        } else {
            db.run('INSERT INTO users VALUES (NULL, ?, ?, ?, ?, NULL)', [req.body.username, req.body.email, req.body.password, req.body.birthday]);
            res.status(201).send('User successfully created').end();
        }
    });
});

/**
 * @api {get} /users/:username Get a user by username
 */
app.get('/users/:username', (req, res) => {
    db.get('SELECT * FROM users WHERE username = ?', req.params.username, (err, user) => {
        if (err) throw err;
        if (user && lodash.isNull(user.favourites)) {
            res.json(user).status(200).end();
        } else if (user) {
            db.all('SELECT title FROM movies WHERE id IN (' + JSON.parse(user.favourites).join() + ')', (err, movieTitles) => {
                if (err || (movieTitles.length === 0)) throw err;
                user.favourites = movieTitles.map(movie => movie.title);
                res.json(user).status(200).end();
            });
        } else {
            res.status(404).send(`User with username '${req.params.username}' doesn't exist.`).end();
        }
    });
});

/**
 * @api {delete} /users/:username Delete a user by username
 */
app.delete('/users/:username', (req, res) => {
    const username = req.params.username;
    db.get('SELECT count(*) FROM users WHERE username = ?', username, (err, row) => {
        if (err) throw err;
        if (row['count(*)'] === 0) {
            res.status(404).send(`User with username '${username}' doesn't exist.`).end();
        } else {
            db.run('DELETE FROM users WHERE username = ?', username, (err) => {
                if (err) throw err;
                //Somehow the response status is 204 but the response body is empty
                res.status(204).send(`Successfully deleted user ${username}`).end();
            });
        }
    });
});

/**
 * @api {patch} /users/:username Update a user by username
 */
app.patch('/users/:username', (req, res) => {
    db.get('SELECT count(*) FROM users WHERE username = ?', req.params.username, (err, row) => {
        if (err) throw err;
        const updatedFields = [];
        if (row['count(*)'] === 0) {
            res.status(404).send(`User with username '${req.params.username}' doesn't exist.`).end();
            return;
        }

        if (req.body.password && (typeof req.body.password !== 'string')) {
            res.status(400).send('Password is not of type string').end();
            return;
        } else if (req.body.password) {
            db.run('UPDATE users SET password = ? WHERE username = ?', [req.body.password, req.params.username], (err) => {
                if (err) throw err;
            });
            updatedFields.push('password');
        } else if (req.body.password === null) {
            res.status(400).send('Password can\'t be null').end();
            return;
        }

        if (req.body.username && (typeof req.body.username !== 'string')) {
            res.status(400).send('Username is not of type string').end();
            return;
        } else if (req.body.username) {
            db.run('UPDATE users SET username = ? WHERE username = ?', [req.body.username, req.params.username], (err) => {
                if (err) throw err;
            });
            updatedFields.push('username');
        } else if (req.body.username === null) {
            res.status(400).send('Username can\'t be null').end();
            return;
        }

        if (req.body.email && (typeof req.body.email !== 'string')) {
            res.status(400).send('Email is not of type string').end();
            return;
        } else if (req.body.email) {
            db.run('UPDATE users SET email = ? WHERE username = ?', [req.body.email, req.params.username], (err) => {
                if (err) throw err;
            });
            updatedFields.push('email');
        } else if (req.body.email === null) {
            res.status(400).send('Email can\'t be null').end();
            return;
        }

        if (req.body.birthday && (typeof req.body.birthday !== 'string')) {
            res.status(400).send('Birthday is not of type string').end();
            return;
        } else if (req.body.birthday === null) {
            db.run('UPDATE users SET birthday = NULL WHERE username = ?', req.params.username, (err) => {
                if (err) throw err;
            });
            updatedFields.push('birthday');
        } else if (req.body.birthday) {
            db.run('UPDATE users SET birthday = ? WHERE username = ?', [req.body.birthday, req.params.username], (err) => {
                if (err) throw err;
            });
            updatedFields.push('birthday');
        }

        if (req.body.favourites && !Array.isArray(req.body.favourites)) {
            res.status(400).send('Favourites is not of type array').end();
            return;
        } else if ((req.body.favourites === null) || (req.body.favourites && req.body.favourites.length === 0)) {
            db.run('UPDATE users SET favourites = NULL WHERE username = ?', req.params.username, (err) => {
                if (err) throw err;
            });
            updatedFields.push('favourites');
            res.status(200).send(`Updated fields: ${updatedFields.join(', ')}`).end();
        } else if (req.body.favourites) {
            db.all('SELECT id FROM movies WHERE id IN (' + req.body.favourites.join(',') + ')', (err, movieIds) => {
                if (err) throw err;
                movieIds = movieIds.map(row => row.id);
                const missingIds = req.body.favourites.filter(id => !movieIds.includes(id));
                if (missingIds.length > 0) {
                    res.status(400).send('One or more movie IDs do not exist').end();
                    return;
                } else {
                    db.run('UPDATE users SET favourites = ? WHERE username = ?', ['[' + req.body.favourites.join(',') + ']', req.params.username], (err) => {
                        if (err) throw err;
                    });
                    updatedFields.push('favourites');
                    res.status(200).send(`Updated fields: ${updatedFields.join(', ')}`).end();
                }
            });
        } else if (updatedFields.length > 0) {
            res.status(200).send(`Updated fields: ${updatedFields.join(', ')}`).end();
        } else {
            res.status(400).send('No valid fields to update').end();
        }
    });
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