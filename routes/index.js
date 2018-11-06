
const express = require('express');
const router = express.Router();
const uuid = require('uuid/v4');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');



const saltRounds = 10;
const users = [
    { id: '2f24vvg', email: 'test@test.com', password: 'password' }
];

const hash = bcrypt.hashSync(users[0].password, saltRounds);

// configure passport.js to use the local strategy
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    (email, password, done) => {
        console.log('Inside local strategy callback');
        // here is where you make a call to the database
        // to find the user based on their username or email address
        const foundUsers = users.filter(el => (el.email === email));
        // no user was found
        if(foundUsers.length === 0) {
            return done('Error. Email not found!');
        } else {
            if(bcrypt.compareSync(password, hash)) {
                // success
                console.log('Local strategy returned true');
                return done(null, foundUsers[0]);
            } else {
                return done('Error. Password not correct!');
            }
        }
    }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
    console.log('Inside serializeUser callback. User id is save to the session file store here');
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    console.log('Inside deserializeUser callback');
    console.log(`The user id passport saved in the session file store is: ${id}`);
    const user = users[0].id === id ? users[0] : false;
    done(null, user);
});

// add & configure middleware
router.use(bodyParser.urlencoded({ extended: false })); // Form data
router.use(bodyParser.json()); // JSON
router.use(session({
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
router.use(passport.initialize());
router.use(passport.session());


// create the homepage route at '/'
// router.get('/', (req, res) => {
//     console.log('Inside the homepage callback function');
//     console.log(req.sessionID);
//     res.send(`you just hit the home page\n`);
// });

// create the login get and post routes
router.get('/login', (req, res) => {
    console.log('Inside GET /login callback function');
    console.log(req.sessionID);
    res.send(`You got the login page!\n`);
});

router.post('/login', (req, res, next) => {
    console.log('Inside POST /login callback function');
    // console.log(req.body);
    // res.send(`You posted to the login page!\n`)
    passport.authenticate('local', (err, user, info) => {
        console.log('err', err);
        if (err) {
            return res.send(err);
        }
        console.log('Inside passport.authenticate() callback');
        console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`);
        console.log(`req.user: ${JSON.stringify(req.user)}`);
        req.login(user, (err) => {
            if (err) {
                return res.send(500, err);
            }
            console.log('Inside req.login() callback');
            console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`);
            console.log(`req.user: ${JSON.stringify(req.user)}`);
            // return res.send('You were authenticated & logged in!\n');
            res.redirect('/test');
        })
    })(req, res, next);
});

router.get('/authrequired', (req, res) => {
    console.log('Inside GET /authrequired callback');
    console.log(`User authenticated? ${req.isAuthenticated()}`);
    if(req.isAuthenticated()) {
        res.send('you hit the authentication endpoint\n');
    } else {
        res.redirect('/');
    }
});

router.get('/', function(req, res) {
    console.log(222222);
  res.render('index');
});

router.get('/test', function(req, res) {
    console.log(333333, req);
    res.render('test');
});


router.get('/user/new', function(req, res) {
res.render('sign_up');
});


router.post('/user/create', function(req, res) {
    users.push({"email": req.param('email'), "password": bcrypt.hashSync(req.param('password'), saltRounds)});
    console.log(111111, users);
    res.redirect('/');
});



module.exports = router;
