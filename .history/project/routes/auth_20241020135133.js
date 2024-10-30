const express = require("express");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const db = require('../db'); // Adjust the path according to your project structure
const router = express.Router();
const session = require('express-session');

// Session middleware (usually in your main app file)
router.use(session({ secret: 'your_secret', resave: false, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());

// Configure Passport.js Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const row = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (!row) return done(null, false, { message: 'Incorrect username or password' });

        const hashedPassword = crypto.pbkdf2Sync(password, row.salt, 310000, 32, 'sha256');
        if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
            return done(null, false, { message: 'Incorrect username or password' });
        }
        return done(null, row);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, { id: user.id, username: user.username });
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Login Route
router.get("/login", (req, res) => {
    res.render('login');
});

router.post('/login/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
}));

router.post('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/');
    });
});

router.post('/clear-users', async (req, res) => {
    try {
        await db.run('DELETE FROM users');
        res.status(200).send('All users cleared');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error clearing users');
    }
});

router.get('/signup', (req, res) => {
    res.render('signup');
});
router.post('/signup', async (req, res, next) => {
    try {
        const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [req.body.username]);
        if (existingUser) {
            return res.status(400).send('Username already taken. Please choose another one.');
        }

        const salt = crypto.randomBytes(16);
        const hashedPassword = crypto.pbkdf2Sync(req.body.password, salt, 310000, 32, 'sha256');

        await db.run('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
            req.body.username,
            hashedPassword,
            salt.toString('hex') // Store salt as hex string
        ]);

        // Assuming the db.run returns an object with lastID
        const user = { id: this.lastID, username: req.body.username };
        req.login(user, err => {
            if (err) return next(err);
            res.redirect('/');
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        return next(err);
    }
});

module.exports = router;
