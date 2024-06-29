const express = require('express'),
    app = express(),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    fs = require('fs');

app.use(morgan('common'));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.send('hello, world');
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