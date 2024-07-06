const express = require('express'),
    app = express(),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    fs = require('fs'),
    lodash = require('lodash'),
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, email TEXT, password TEXT, birthday TEXT, favourites TEXT)');
    db.run('CREATE TABLE movies (id INTEGER PRIMARY KEY, title TEXT, description TEXT, genre TEXT, director TEXT, image TEXT)');
});

app.use(morgan('common'));
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/directors?:limit', (req, res) => {
    fs.readFile(__dirname + '/directors.json', 'utf8', (err, data) => {
        if (err) throw err;
        let directors = JSON.parse(data)['directors'];
        if (req.query['limit']) {
            const limit = Number(req.query['limit']);
            if (isNaN(limit)) throw new Error('Invalid limit');
            if (limit > 0) {
                directors = directors.slice(0, limit);
            }
            res.json({ "directors": directors });
        } else {
            res.json({ "directors": directors });
        }
    });
});

app.get('/genres?:limit', (req, res) => {
    fs.readFile(__dirname + '/genres.json', 'utf8', (err, data) => {
        if (err) throw err;
        let genres = JSON.parse(data)['genres'];
        if (req.query['limit']) {
            const limit = Number(req.query['limit']);
            if (isNaN(limit)) throw new Error('Invalid limit');
            if (limit > 0) {
                genres = genres.slice(0, limit);
            }
            res.json({ "genres": genres });
        } else {
            res.json({ "genres": genres });
        }
    });
});

app.get('/movies?:limit', (req, res) => {
    const limit = Number(req.query['limit']);
    if (lodash.isNumber(limit) && limit > 0) {
        if (isNaN(limit)) {
            res.status(400).end();
        }
        db.all('SELECT title FROM movies LIMIT ?', limit, (err, rows) => {
            if (err) throw err;
            res.json({ "movies": rows.map(row => row.title) });
        });
    } else {
        db.all('SELECT title FROM movies', (err, rows) => {
            if (err) throw err;
            res.json({ "movies": rows.map(row => row.title) });
        });
    }
});

app.get('/genres/:name', (req, res) => {
    fs.readFile(__dirname + '/' + req.params.name + '.json', 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.status(404).send('The genre ' + req.params.name + ' does not exist.');
            } else {
                throw err;
            }
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.post('/movies', (req, res) => {
    db.get('SELECT count(*) FROM movies WHERE title = ?', req.body.title, (err, row) => {
        if (err) throw err;
        if (row['count(*)'] > 0) {
            res.sendStatus(409).end();
        } else {
            db.run('INSERT INTO movies VALUES (NULL, ?, ?, ?, ?, ?)', [req.body.title, req.body.description, req.body.genre, req.body.director, req.body.image]);
            res.sendStatus(201).end();
        }
    });
});

app.get('/movies/:title', (req, res) => {
    db.get('SELECT * FROM movies WHERE title = ?', req.params.title, (err, row) => {
        if (err) throw err;
        if (row) {
            res.json(row);
        } else {
            res.sendStatus(404).end();
        }
    });
});

app.post('/users', (req, res) => {
    db.get('SELECT count(*) FROM users WHERE username = ?', req.body.username, (err, row) => {
        if (err) throw err;
        if (row['count(*)'] > 0) {
            res.sendStatus(409).end();
        } else if (req.body.favourites.length > 0) {
            const favourites = req.body.favourites;
            const query = 'SELECT id FROM movies WHERE id IN (' + favourites.join(',') + ')';
            db.all(query, (err, rows) => {
                if (err) throw err;
                const movieIds = rows.map(row => row.id);
                const missingIds = favourites.filter(id => !movieIds.includes(id));
                if (missingIds.length > 0) {
                    res.status(400).end();
                } else {
                    db.run('INSERT INTO users VALUES (NULL, ?, ?, ?, ?, ?)', [req.body.username, req.body.email, req.body.password, req.body.birthday, '[' + favourites.join(', ') + ']']);
                    res.sendStatus(201).end();
                }
            });
        } else {
            db.run('INSERT INTO users VALUES (NULL, ?, ?, ?, ?, NULL)', [req.body.username, req.body.email, req.body.password, req.body.birthday]);
            res.sendStatus(201).end();
        }
    });
});

app.get('/users/:username', (req, res) => {
    db.get('SELECT * FROM users WHERE username = ?', req.params.username, (err, userRow) => {
        if (err) throw err;
        if (userRow) {
            const parsedFavourites = JSON.parse(userRow['favourites']);
            db.all('SELECT title FROM movies WHERE id IN (' + parsedFavourites.join() + ')', (err, movieTitles) => {
                if (err) throw err;
                movieTitles = movieTitles.map(row => row.title);
                userRow['favourites'] = movieTitles;
                res.json(userRow);
            });
        } else {
            res.sendStatus(404).end();
        }
    });
});

app.delete('/users/:username', (req, res) => {
    db.get('SELECT count(*) FROM users WHERE username = ?', req.params.username, (err, row) => {
        if (err) throw err;
        if (row['count(*)'] === 0) {
            res.sendStatus(404).end();
        } else {
            db.run('DELETE FROM users WHERE username = ?', req.params.username, (err) => {
                if (err) throw err;
                res.sendStatus(204).end();
            });
        }
    });
});

app.patch('/users/:username', (req, res) => {
    db.get('SELECT count(*) FROM users WHERE username = ?', req.params.username, (err, row) => {
        if (err) throw err;
        if (row['count(*)'] === 0) {
            res.sendStatus(404).end();
        } else {
            if (req.body.password) {
                db.run('UPDATE users SET password = ? WHERE username = ?', [req.body.password, req.params.username], (err) => {
                    if (err) throw err;
                });
            }
            if (req.body.username) {
                db.run('UPDATE users SET username = ? WHERE username = ?', [req.body.username, req.params.username], (err) => {
                    if (err) throw err;
                });
            }
            if (req.body.email) {
                db.run('UPDATE users SET email = ? WHERE username = ?', [req.body.email, req.params.username], (err) => {
                    if (err) throw err;
                });
            }
            if (req.body.birthday) {
                db.run('UPDATE users SET birthday = ? WHERE username = ?', [req.body.birthday, req.params.username], (err) => {
                    if (err) throw err;
                });
            }
            if (!req.body.password && !req.body.username && !req.body.email && !req.body.birthday) {
                res.sendStatus(400).end();
            } else {
                res.sendStatus(204).end();
            }
        }
    });
});

app.use(methodOverride());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
    next();
});

app.listen(8000, () => {
    console.log('Your app is listening on port 8000.');
});