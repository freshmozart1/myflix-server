const mongoose = require('mongoose'),
    { body, param } = require('express-validator'),
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
            console.log(req.user.favourites);
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
 * This helper function is a express-validator that checks if a field of a request exists as an ID in a collection of a MongoDB database.
 * @param {*} request Where to look for the field in the request
 * @param {String} field The name of the field to check
 * @param {*} collection The collection to check the field against
 * @param {String} errorMessage The error message to return if the field is not found in the collection
 * @returns {ValidationChain}
 */
function _validateIdInCollection(request, field, collection, errorMessage) {
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
function _validateFavouritesAndBail(bailLevel = 'request') {
    return body('favourites', 'Favourites must be an non empty array').isArray({ min: 1 }).bail({level: bailLevel}).optional({ values: 'falsy' }).custom(async (favourites) => {
        for (const id of favourites) {
            if (!mongoose.Types.ObjectId.isValid(id)) return Promise.reject('Invalid movie ID in favourites.');
            try {
                if (!(await movies.findById(id))) return Promise.reject('Invalid movie ID in favourites.');
            } catch (e) {
                return Promise.reject('Database error + ' + e);
            }
        }
        return true;
    }).bail({level: bailLevel});
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
 * @param {*} request Where to look for the field in the request.
 * @param {String} bailLevel The level to bail out of the validation chain.
 * @returns {ValidationChain}
 */
function _validateUsername(request, bailLevel = 'request') {
    return request('username').custom(async (username) => {
        if (username.length < 5) return Promise.reject('The username must be at least 5 characters long.');
        if (!username.match(/^[a-zA-Z0-9]+$/)) return Promise.reject('The username contains non alphanumeric characters - not allowed.');
        if (request === param) {
            try {
                if (!(await users.findOne({ username }))) return Promise.reject('The username provided in the URL does not exist in the database.');
            } catch (e) {
                return Promise.reject('Database error: ' + e);
            }
        }
        return true;
    }).bail({ level: bailLevel });
}

module.exports = {
    _validateUserFieldUnchanged,
    _validateIdInCollection,
    _ifFieldEmptyBail,
    _validateFavouritesAndBail,
    _valiDate,
    _checkBodyEmpty,
    _validateUsername
};
