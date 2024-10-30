const express = require("express");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const db = require('../db');
const router = express.Router();

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!user) {
            console.log('No user found with username:', username);
            return done(null, false, { message: 'Incorrect username or password' });
        }

        const hashedPassword = crypto.pbkdf2Sync(password, Buffer.from(user.salt, 'hex'), 310000, 32, 'sha256');
        if (!crypto.timingSafeEqual(Buffer.from(user.hashed_password, 'hex'), hashedPassword)) {
            return done(null, false, { message: 'Incorrect username or password' });
        }

        console.log('User authenticated:', user);
        return done(null, user);

    } catch (err) {
        console.error("Error during authentication:", err);
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

router.post('/login/password', passport.authenticate('local'));

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
        console.error("Error clearing users:", err);
        res.status(500).send('Error clearing users');
    }
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res, next) => {
    try {
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [req.body.username], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
        console.log('Existing user found:', existingUser);
        if (existingUser) {
            return res.status(400).send('Username ' + existingUser.username + ' already taken. Please choose another one.');
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const hashedPassword = crypto.pbkdf2Sync(req.body.password, Buffer.from(salt, 'hex'), 310000, 32, 'sha256').toString('hex');
        console.log('Inserting user...');

        const result = await new Promise((resolve, reject) => {
            db.run('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
                req.body.username,
                hashedPassword,
                salt
            ], function (err) {
                if (err) reject(err);
                resolve(this);
            });
        });
        console.log('Inserted user with user ID:', result.lastID);
        const user = { id: result.lastID, username: req.body.username };

        req.login(user, err => {
            if (err) return next(err);
            res.redirect('/');
        });
    } catch (err) {
        console.error('Error while registering user:', err);
        return next(err);
    }
});

module.exports = router;
