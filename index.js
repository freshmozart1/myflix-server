const express = require('express'),
    app = express(),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override');

app.use(morgan('common'));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.send('hello, world');
});

app.get('/movies', (req, res) => {
    res.sendFile('movies.json', { root: __dirname });
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
    next();
});

app.listen(8000, () => {
    console.log('Your app is listening on port 8000.');
});