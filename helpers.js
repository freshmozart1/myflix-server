const mongoose = require('mongoose'),
    { body, param } = require('express-validator'),
    { parseISO, isValid } = require('date-fns'),
    models = require('./models'),
    movies = models.movie,
    users = models.user;

/**
 * This helper function is a express-validator that checks if a field of a request is the same as the current data stored for a user.
 * @param {*} request Where to look for the field in the request
 * @param {String} field The field to check
 * @returns {ValidationChain}
 */
function _validateFieldUnchanged(request, field) {
    return request(field, field + ' is the same as the current ' + field + '.').custom((fieldValue, { req }) => {
        if (field === 'password') return !req.user.validatePassword(fieldValue);
        if (field === 'favourites') {
            return fieldValue.length !== req.user.favourites.length || fieldValue.some((id, i) => id !== req.user.favourites[i].toHexString());
        }
        return fieldValue !== req.user[field];
    });
}

/**
 * This helper function is a express-validator that checks if a field of a request contains ObjectIds that exist in a collection.
 * @param {*} request Where to look for the field in the request
 * @param {String} field The name of the field to check
 * @param {*} collection The collection to check the field against
 * @param {String} errorMessage The error message to return if the field is not found in the collection
 * @returns {ValidationChain}
 */
function _validateIdInCollection(request, field, collection, errorMessage) {
    return request(field).custom(async fieldValue => {
        try {
            const isValidId = async id => mongoose.Types.ObjectId.isValid(id) && await collection.findById(id);
            if (Array.isArray(fieldValue)) {
                for (const id of fieldValue) {
                    if (!await isValidId(id)) return Promise.reject(errorMessage);
                }
            } else {
                if (!await isValidId(fieldValue)) return Promise.reject(errorMessage);
            }
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
        if (!/^[a-zA-Z0-9]+$/.test(username)) return Promise.reject('The username contains non alphanumeric characters - not allowed.');
        try {
            const userExists = await users.exists({ username });
            if ((request === body && userExists) || (request === param && !userExists)) return Promise.reject(`The username '${username}' ${userExists ? 'already exists' : 'does not exist'} in the database.`);
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
            const movieExists = await movies.exists({ title });
            if((request === body && movieExists) || (request === param && !movieExists)) return Promise.reject(`The movie '${title}' ${movieExists ? 'already exists' : 'does not exist'} in the database.`);
        } catch (e) {
            return Promise.reject('Database error: ' + e);
        }
        return true;
    });
}

module.exports = {
    _validateFieldUnchanged,
    _validateIdInCollection,
    _valiDate,
    _checkBodyEmpty,
    _validateUsername,
    _validateMovieTitle
};
