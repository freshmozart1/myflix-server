const { id } = require('date-fns/locale');

const mongoose = require('mongoose'),
    { body, param } = require('express-validator'),
    { parseISO, isValid } = require('date-fns'),
    models = require('./models'),
    movies = models.movie,
    users = models.user;

/**
 * This helper function is a express-validator used only by the PATCH /users/:username route to check if a value in the request body is the same as the current value fo a user.
 * @param {*} request Where to look for the field in the request
 * @param {String} field The field to check
 * @returns {ValidationChain}
 */
function _validateUserFieldUnchanged(request, field) {
    return request(field, field + ' is the same as the current ' + field + '.').custom((fieldValue, { req }) => {
        if (field === 'password' && req.user.validatePassword(fieldValue)) return false;
        if (field === 'favourites') {
            if (fieldValue.length !== req.user.favourites.length) return true;
            for (let i = 0; i < fieldValue.length; i++) {
                if (fieldValue[i] !== req.user.favourites[i].toHexString()) return true;
            }
            return false;
        }
        if (fieldValue === req.user[field]) return false;
        return true;
    });
}

/**
 * This helper function is a express-validator that checks if a field of a request contains ids that exist in a collection.
 * @param {*} request Where to look for the field in the request
 * @param {String} field The name of the field to check
 * @param {*} collection The collection to check the field against
 * @param {String} errorMessage The error message to return if the field is not found in the collection
 * @returns {ValidationChain}
 */
function _validateIdInCollection(request, field, collection, errorMessage) {
    return request(field).custom(async fieldValue => {
        try {
            if (Array.isArray(fieldValue)) for (const id of fieldValue) {
                if (!mongoose.Types.ObjectId.isValid(id) || !(await collection.findById(id))) return Promise.reject(errorMessage);
            }
            if (!mongoose.Types.ObjectId.isValid(fieldValue) || !(await collection.findById(id))) return Promise.reject(errorMessage);
            return true;
        } catch (e) {
            return Promise.reject('Database error: ' + e);
        }
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
        return isValid(parseISO(value));
    });
}

/**
 * This helper function is a middleware function that checks if the body of a request is empty.
 * @param {*} req The request object
 * @param {*} res The response object
 * @param {*} next The next middleware function
 * @returns {void}
 */
function _checkBodyEmpty(req, res, next) {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).end('My Body Is Nobody');
    }
    next();
}

/**
 * This helper function is a express-validator that checks if a username is valid.
 * If the request parameter is the body section of a request, it returns an error message
 * if the username exists in the database. If the request parameter is the parameter
 * section of a request, it returns an error message if the username does not exist
 * in the database.
 * @param {*} request Where to look for the field in the request.
 * @returns {ValidationChain}
 */
function _validateUsername(request) {
    return request('username').custom(async (username) => {
        if (username.length < 5) return Promise.reject('The username must be at least 5 characters long.');
        if (!username.match(/^[a-zA-Z0-9]+$/)) return Promise.reject('The username contains non alphanumeric characters - not allowed.');
        try {
            const user = await users.exists({ username });
            if ((request === body) && user) return Promise.reject('The username \'' + username + '\' already exists in the database.');
            if ((request === param) && !user) return Promise.reject('The username \'' + username + '\' does not exist in the database.');
        } catch (e) {
            return Promise.reject('Database error: ' + e);
        }
        return true;
    });
}

/**
 * This helper function is a express-validator. If the request parameter is the body section
 * of a request, it checks if a movie exists in the database and if it does,
 * it returns an error message. If the request parameter is the parameter section of a
 * request, it checks if a movie exists in the database and if it does not, it returns an error message.
 * @param {*} request Where to look for the field in the request.
 * @returns {ValidationChain}
 */
function _validateMovieTitle(request) {
    return request('title').custom(async (title) => {
        try {
            const movie = await movies.exists({ title });
            if ((request === body) && movie) return Promise.reject('The movie \'' + title + '\' already exists in the database.');
            if ((request === param) && !movie) return Promise.reject('The movie \'' + title + '\' does not exist in the database.');
            return true;
        } catch (e) {
            return Promise.reject('Database error: ' + e);
        }
    });
}

module.exports = {
    _validateUserFieldUnchanged,
    _validateIdInCollection,
    _valiDate,
    _checkBodyEmpty,
    _validateUsername,
    _validateMovieTitle
};
