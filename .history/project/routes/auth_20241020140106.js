const express = require("express");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const db = require('../db');
const router = express.Router();
const session = require('express-session');

router.use(session({ secret: 'your_secret', resave: false, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        console.log('Attempting to log in with username:', username);
        const row = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        
        if (!row) {
            console.log('User not found:', username);
            return done(null, false, { message: 'Incorrect username or password' });
        }

        const salt = Buffer.from(row.salt, 'hex');
        const hashedPassword = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256');

        console.log('Comparing passwords:');
        console.log('Stored hashed password:', row.hashed_password);
        console.log('Computed hashed password:', hashedPassword);

        const storedHashedPassword = Buffer.from(row.hashed_password); // Ensure this is a Buffer

        if (!crypto.timingSafeEqual(storedHashedPassword, hashedPassword)) {
            console.log('Password mismatch for user:', username);
            return done(null, false, { message: 'Incorrect username or password' });
        }
        
        console.log('Login successful for user:', username);
        return done(null, row);
    } catch (err) {
        console.error('Error during login:', err);
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
