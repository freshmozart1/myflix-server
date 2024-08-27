const mongoose = require('mongoose'),
    { body, param, matchedData, validationResult, checkExact } = require('express-validator'),
    { parseISO, isValid } = require('date-fns'),
    models = require('./models'),
    directors = models.director,
    genres = models.genre,
    movies = models.movie,
    users = models.user;

//todo #12
/**
 * This helper function is a express-validator that checks if a field of a request is the same as the current data stored for a user.
 * @param {*} request Where to look for the field in the request
 * @param {String} field The field to check
 * @returns {ValidationChain}
 */
function _validateUserFieldChanged(request, field) {
    return request(field, field + ' is the same as the current ' + field + '.').custom((fieldValue, { req }) => {
        if (field === 'password') return !req.user.validatePassword(fieldValue);
        if (field === 'favourites') {
            if ((req.user.favourites === null && fieldValue !== null) || (fieldValue === null && req.user.favourites !== null)) return true;
            if (req.user.favourites === null && fieldValue === null) return false;
            return fieldValue.length !== req.user.favourites.length || fieldValue.some((id, i) => id !== req.user.favourites[i].toHexString());
        }
        if (field === 'birthday') {
            if ((req.user.birthday === null && fieldValue !== null) || (fieldValue === null && req.user.birthday !== null)) return true;
            if (req.user.birthday === null && fieldValue === null) return false;
            return (new Date(fieldValue)).toISOString() !== req.user.birthday.toISOString()
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
        return value === null ? true : isValid(parseISO(value));
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
 * This helper function is a express-validator that checks if a directors name is valid.
 * If the request parameter is the body section of a request, it returns an error message
 * if the directors name exists in the database. If the request parameter is the parameter
 * section of a request, it returns an error message if the directors name does not exist
 * in the database.
 * @param {*} request 
 * @returns {ValidationChain}
 */
function _validateDirectorName(request) {
    return request('name').custom(async name => {
        if (name.length < 3) return Promise.reject('The name must be at least 3 characters long.');
        try {
            const directorExists = await directors.exists({ name });
            if ((request === body && directorExists) || (request === param && !directorExists)) return Promise.reject(`The director '${name}' ${directorExists ? 'already exists' : 'does not exist'} in the database.`);
        } catch (e) {
            return Promise.reject('Database error: ' + e);
        }
        return true;
    });
}

function _validateGenreName(request) {
    return request('name').custom(async name => {
        if (name.length < 3) return Promise.reject('The name must be at least 3 characters long.');
        try {
            const genreExists = await genres.exists({ name });
            if ((request === body && genreExists) || (request === param && !genreExists)) return Promise.reject(`The genre '${name}' ${genreExists ? 'already exists' : 'does not exist'} in the database.`);
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
            if ((request === body && movieExists) || (request === param && !movieExists)) return Promise.reject(`The movie '${title}' ${movieExists ? 'already exists' : 'does not exist'} in the database.`);
        } catch (e) {
            return Promise.reject('Database error: ' + e);
        }
        return true;
    });
}

async function _getDocuments(req, res, collection) {
    try {
        validationResult(req).throw();
        const data = matchedData(req);
        if (collection.modelName === 'movie') {
            if (data.title) {
                const movie = await collection.findOne({ title: data.title }).populate('genre').populate('director');
                return movie ? res.status(200).json(movie) : res.status(404).end('Movie not found.');
            } else {
                let query = collection.find();
                if (data.limit) query = query.limit(parseInt(data.limit));
                const movieList = await query.populate('genre').populate('director');
                return movieList.length === 0 ? res.status(404).end('No movies found.') : res.status(200).json(movieList);
            }
        } else if (collection.modelName === 'user') {
            const user = await collection.findOne({ username: data.username }).select('-password -email -birthday -__v').populate({ path: 'favourites', select: '-__v', populate: { path: 'genre director', select: '-__v' } });
            return user ? res.status(200).json(user) : res.status(404).end('User not found.');
        } else if (data.name) {
            const document = await collection.findOne({ name: data.name });
            return document ? res.status(200).json(document) : res.status(404).end(data.name + ' was not found.');
        } else {
            let query = collection.find();
            if (data.limit) query = query.limit(parseInt(data.limit));
            const documentList = await query;
            return documentList.length === 0 ? res.status(404).end(`No ${collection.modelName} found.`) : res.status(200).json(documentList);
        }
    } catch (e) {
        if (Array.isArray(e.errors) && e.errors[0].msg) return res.status(422).end(e.errors[0].msg);
        return res.status(500).end('Error: ' + e);
    }
}

async function _createDocument(req, res, collection) {
    try {
        validationResult(req).throw();
        const data = matchedData(req);
        switch (collection.modelName) {
            case 'user':
                data.password = users.hashPassword(data.password);
                data.birthday = data.birthday ? data.birthday : null;
                data.favourites = data.favourites ? data.favourites : null;
                break;
            case 'movie':
                data.imagePath = data.imagePath ? data.imagePath : null;
                break;
            case 'genre':
                break;
            case 'director':
                data.deathday = data.deathday ? data.deathday : null;
                data.biography = data.biography ? data.biography : null;
                break;
            default:
                throw new Error('Unknown collection.');
        }
        await collection.create(data);
        res.status(201).json(data);
    } catch (e) {
        if (Array.isArray(e.errors) && e.errors[0].msg) return res.status(422).end(e.errors[0].msg);
        return res.status(500).end('Database error: ' + e);
    }
}

function _validateFavourites() {
    return body('favourites').custom(async favourites => {
        if (favourites === null) return true;
        if (!Array.isArray(favourites) || favourites.length === 0) return Promise.reject('Favourites must either be null or an array of movie ids.');
        for (const id of favourites) {
            if (!mongoose.Types.ObjectId.isValid(id) || ! await movies.findById(id)) return Promise.reject('Invalid movie ID in favourites.');
        }
        return true;
    });
}

function _dynamicRouteValidation(req, res, next) {
    const validationChain = {
        '/directors': [
            body('name', 'The name is required').notEmpty().bail({ level: 'request' }),
            _validateDirectorName(body).bail({ level: 'request' }),
            body('birthday', 'Birthday is required').notEmpty().bail({ level: 'request' }),
            _valiDate(body, 'birthday', 'Birthday is not a valid date.').bail({ level: 'request' }),
            _valiDate(body, 'deathday', 'Deathday is not a valid date.').bail({ level: 'request' }).optional({ values: 'falsy' }),
            body('biography', 'Biography is required').notEmpty().bail({ level: 'request' }),
            body('biography', 'Biography must be a string').isString().bail({ level: 'request' })
        ],
        '/genres': [
            body('name', 'The name is required').notEmpty().bail({ level: 'request' }),
            body('name', 'The name must be a string').isString().bail({ level: 'request' }),
            _validateGenreName(body).bail({ level: 'request' }),
            body('description', 'The description is required').notEmpty().bail({ level: 'request' }),
            body('description', 'The description must be a string').isString().bail({ level: 'request' })
        ],
        '/movies': [
            body('title', 'The title is required').notEmpty().bail({ level: 'request' }),
            body('title', 'The title must be a string').isString().bail({ level: 'request' }),
            body('description', 'The description is required').notEmpty().bail({ level: 'request' }),
            body('description', 'The description must be a string').isString().bail({ level: 'request' }),
            body('genre', 'A genre ID is required').notEmpty().bail({ level: 'request' }),
            body('director', 'A director ID is required').notEmpty().bail({ level: 'request' }),
            body('imagePath').optional({ values: 'falsy' }),
            _validateMovieTitle(body).bail({ level: 'request' }),
            _validateIdInCollection(body, 'genre', genres, 'Genre not found in database.').bail({ level: 'request' }),
            _validateIdInCollection(body, 'director', directors, 'Director not found in database.').bail({ level: 'request' })
        ],
        '/users': [
            _validateUsername(body).bail({ level: 'request' }),
            body('email', 'Email is required').notEmpty().bail({ level: 'request' }),
            body('email', 'Email does not appear to be valid').isEmail().normalizeEmail().bail({ level: 'request' }),
            body('password', 'Password is required').notEmpty().bail({ level: 'request' }),
            _valiDate(body, 'birthday', 'Birthday is not a valid date.').bail({ level: 'request' }).optional({ values: 'falsy' }),
            _validateFavourites().bail({ level: 'request' }).optional({ values: 'falsy' })
        ]
    }[req.path];
    if (!validationChain) return next();
    validationChain.push(checkExact([], { message: 'Request contains unknown fields.' }));
    return validationChain.reduce((acc, fn) => { //This line will build a chain of promises
        return acc.then(() => { //If the last promise in the chain resolves...
            return new Promise((resolve, reject) => { //... this line will add a new Promise to the chain.
                /*
                express-validators like body() return a middleware function.
                fn calls this middleware function with the request, response and a callback function.
                */
                return fn(req, res, err => {
                    return err ? reject(err) : resolve() //If the middleware function from the express-validator returns an error, reject the promise.
                });
            });
        });
    }, Promise.resolve())
        .then(() => next()) //If all promises resolve, call the next middleware function.
        .catch(next); // This will catch errors and pass them somewhere, but I'm not sure where.
}

module.exports = {
    _validateUserFieldChanged,
    _validateIdInCollection,
    _valiDate,
    _checkBodyEmpty,
    _validateUsername,
    _validateDirectorName,
    _validateMovieTitle,
    _getDocuments,
    _createDocument,
    _validateFavourites,
    _dynamicRouteValidation
};
