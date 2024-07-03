const express = require('express'),
    app = express(),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    fs = require('fs'),
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run('CREATE TABLE users (username TEXT, email TEXT, password TEXT, birthday TEXT, favourites TEXT)');
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
    fs.readFile(__dirname + '/movies.json', 'utf8', (err, data) => {
        if (err) throw err;
        let movies = JSON.parse(data)['movies'];
        if (req.query['limit']) {
            const limit = Number(req.query['limit']);
            if (isNaN(limit)) throw new Error('Invalid limit');
            if (limit > 0) {
                movies = movies.slice(0, limit);
            }
            res.json({ "movies": movies });
        } else {
            res.json({ "movies": movies });
        }
    });
});

app.get('/genres/:name', (req, res) => {
    fs.readFile(__dirname + '/' + req.params.name + '.json', 'utf8', (err, data) => {
        if (err) {
            console.log(err.code);
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

app.get('/movies/:title', (req, res) => {
    fs.readFile(__dirname + '/' + req.params.title + '.json', 'utf8', (err, data) => {
        if (err) {
            console.log(err.code);
            if (err.code === 'ENOENT') {
                res.status(404).send('The movie ' + req.params.title + ' does not exist.');
            } else {
                throw err;
            }
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.post('/users', (req, res) => {
    db.get('SELECT count(*) FROM users WHERE username = ?', req.body.username, (err, row) => {
        if (err) throw err;
        if (row['count(*)'] > 0) {
            res.sendStatus(409).end();
        } else {
            db.run('INSERT INTO users VALUES (?, ?, ?, ?, ?)', [req.body.username, req.body.email, req.body.password, req.body.birthday, req.body.favourites.toString()]);
            res.sendStatus(201).end();
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