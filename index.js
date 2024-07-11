const express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    models = require('./models.js'),
    movies = models.movie,
    users = models.user,
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
app.post('/directors', (req, res) => {

});

/**
 * @api {get} /directors?:limit Get all or a limited number of directors
 */
app.get('/directors?:limit', (req, res) => {

});

/**
 * @api {get} /directors/:name Get a director by name
 */
app.get('/directors/:name', (req, res) => {

});

/**
 * @api {get} /genres?:limit Get all or a limited number of genres
 */
app.get('/genres?:limit', (req, res) => {

});

/**
 * @api {get} /genres/:name Get a genre by name
 */
app.get('/genres/:name', (req, res) => {

});

/**
 * @api {post} /genres Create a new genre
 */
app.post('/genres', (req, res) => {

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

/**
 * @api {get} /users/:username Get a user by username
 */
app.get('/users/:username', (req, res) => {

});

/**
 * @api {delete} /users/:username Delete a user by username
 */
app.delete('/users/:username', (req, res) => {

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