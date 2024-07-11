const express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    movies = Models.Movie,
    users = Models.User,
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override');

mongoose.connect('mongodb://localhost:27017/myflix');

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
app.post('/users', (req, res) => {

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