const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: { type: mongoose.Schema.Types.ObjectId, ref: 'genre', required: true },
    director: { type: mongoose.Schema.Types.ObjectId, ref: 'director', required: true },
    imagePath: String
});

let userSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    birthday: {type: mongoose.Schema.Types.Date},
    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'movie' }]
});

/**
 * Generates a hashed password
 * @param {*} password the password to be hashed
 * @returns  the hashed password
 * @todo replace snychronous bcrypt.hash with asynchronous bcrypt.hash to avoid blocking the event loop
 */
userSchema.statics.hashPassword = (password)  => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) { //because we need to access the user object, we can't use an arrow function
    return bcrypt.compareSync(password, this.password);
};

let genreSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }
});

let directorSchema = mongoose.Schema({
    name: { type: String, required: true },
    birthday: { type: mongoose.Schema.Types.Date, required: true },
    deathday: { type: mongoose.Schema.Types.Date },
    biography: { type: String, required: true }
});

let movie = mongoose.model('movie', movieSchema);
let user = mongoose.model('user', userSchema);
let genre = mongoose.model('genre', genreSchema);
let director = mongoose.model('director', directorSchema);

module.exports.movie = movie;
module.exports.user = user;
module.exports.genre = genre;
module.exports.director = director;