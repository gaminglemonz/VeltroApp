const express = require("express");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const db = require('../db');
const router = express.Router();

// Configure Passport.js Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const row = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (!row) return done(null, false, { message: 'Incorrect username or password' });

        const hashedPassword = crypto.pbkdf2Sync(password, Buffer.from(row.salt), 310000, 32, 'sha256');

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

router.get("/login", (req, res) => {
    res.render('login');
});

// Unified Login Route
router.post('/login/password', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error("Error while logging in: " + err);
            res.redirect('/login');
            return next(err);
        }
        if (!user) {
            console.error('Failed to authenticate: ' + info.message);
            return res.redirect('/login');
        }
        req.login(user, (err) => {
            if (err) {
                console.error("Error during login: " + err);
                return next(err);
            }
            return res.redirect('/login');
        });
    })(req, res, next);
});

// Logout Route
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

// Signup Route
router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res, next) => {
    try {
        // Check if username already exists
        const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [req.body.username]);
        console.log(existingUser)
        if (existingUser && existingUser !== undefined) {
            return res.status(400).send('User ' +  existingUser + ' already taken. Please choose another one.');
        }

        const salt = crypto.randomBytes(16);
        const hashedPassword = crypto.pbkdf2Sync(req.body.password, salt, 310000, 32, 'sha256');

        console.log('Inserting user...')
        const result = await db.run('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
            req.body.username,
            hashedPassword,
            salt.toString('hex')
        ]);
        console.log('Inserted user with user ID', result.lastID)

        const user = { id: result.lastID, username: req.body.username };
        req.login(user, err => {
            if (err) return next(err);
            res.redirect('/');
        });
    } catch (err) {
        console.error('Error while registering user', err);
        return next(err);
    }
});

module.exports = router;
