//npm modules
const express = require('express');
const uuid = require('uuid/v4');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');

// create the server
const app = express();

// add & configure middleware
app.use(bodyParser.urlencoded({ extended: false })); // Form data
app.use(bodyParser.json()); // JSON
app.use(session({
    genid: (req) => {
        console.log('Inside the session middleware');
        console.log(req.sessionID);
        return uuid(); // use UUIDs for session IDs
    },
    store: new FileStore(),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10*60*1000 }
}));

// create the homepage route at '/'
app.get('/', (req, res) => {
    console.log('Inside the homepage callback function');
    console.log(req.sessionID);
    res.send(`you just hit the home page\n`);
});

// create the login get and post routes
app.get('/login', (req, res) => {
    console.log('Inside GET /login callback function');
    console.log(req.sessionID);
    res.send(`You got the login page!\n`);
});

app.post('/login', (req, res) => {
    console.log('Inside POST /login callback function');
    console.log(req.body);
    res.send(`You posted to the login page!\n`)
});

// tell the server what port to listen on
app.listen(3000, () => {
    console.log('Listening on localhost:3000')
});
