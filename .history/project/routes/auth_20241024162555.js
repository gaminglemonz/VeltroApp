const express = require("express");
const passport = require('passport');
const bcrypt = require('bcrypt');
const db = require('../db'); // Make sure to import your database connection
const router = express.Router();

// Signup Route
router.get('/signup', (req, res) => {
    res.render('signup'); // Render signup page
});

router.post('/signup', async (req, res, next) => {
    try {
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [req.body.username], (err, row) => {
                if (err) {
                    console.error("Database error during signup user check:", err);
                    return reject(err);
                }
                resolve(row);
            });
        });

        if (existingUser) {
            return res.status(400).send('Username ' + existingUser.username + ' already taken. Please choose another one.');
        }

        // Hashing the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        console.log('Hashed Password on signup:', hashedPassword); // Log the hashed password

        const result = await new Promise((resolve, reject) => {
            db.run('INSERT INTO users (username, hashed_password) VALUES (?, ?)', [
                req.body.username,
                hashedPassword // Ensure to store as string
            ], function (err) {
                if (err) {
                    console.error("Error inserting user:", err);
                    return reject(err);
                }
                resolve(this);
            });
        });

        console.log('Inserted user with user ID:', result.lastID);
        const user = { id: result.lastID, username: req.body.username };
        req.login(user, err => {
            if (err) return next(err);
            res.redirect('/'); // Redirect to homepage after signup
        });
    } catch (err) {
        console.error('Error while registering user:', err);
        return next(err);
    }
});

// Login Route
router.get('/login', (req, res) => {
    res.render('login'); // Render login page
});

router.post('/login/password', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error("Error while logging in:", err);
            return next(err);
        }
        if (!user) {
            console.error('Failed to authenticate', info.message);
            return res.redirect('/login'); // Redirect back to login if failed
        }
        req.login(user, err => {
            if (err) return next(err);
            res.redirect('/'); // Redirect to homepage after successful login
        });
    })(req, res, next);
});

// Logout Route
router.post('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/'); // Redirect to homepage after logout
    });
});

// Clear Users Route (for testing purposes)
router.post('/clear-users', async (req, res) => {
    try {
        await db.run('DELETE FROM users');
        res.status(200).send('All users cleared');
    } catch (err) {
        console.error("Error clearing users:", err);
        res.status(500).send('Error clearing users');
    }
});

module.exports = router;
