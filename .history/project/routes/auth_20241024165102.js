const express = require("express");
const passport = require('passport');
const bcrypt = require('bcrypt');
const db = require('../db'); // Ensure correct database connection
const router = express.Router();

// Signup Route
router.get('/signup', (req, res) => {
    res.render('signup'); // Render signup page
});

router.post('/signup', function(req, res, next) {
  var salt = crypto.randomBytes(16);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
    if (err) { return next(err); }
    db.run('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
      req.body.username,
      hashedPassword,
      salt
    ], function(err) {
      if (err) { return next(err); }
      var user = {
        id: this.lastID,
        username: req.body.username
      };
      req.login(user, function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });
  });
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

module.exports = router;
