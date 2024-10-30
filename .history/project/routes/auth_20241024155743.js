const express = require("express");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const db = require('../db');
const router = express.Router();

router.post('/signup', function(req, res, next) {
  var salt = crypto.randomBytes(16);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', (err, hashedPassword) => {
    if (err) { return next(err); }
    db.run('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
      req.body.username,
      hashedPassword,
      salt
    ], (err) => {
      if (err) { return next(err); }
      const user = {
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

  passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

router.get("/login", (req, res, next) => {
    res.render('login');
});

router.post('/login/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
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

        if (existingUser) {
            return res.status(400).send('Username ' + existingUser.username + ' already taken. Please choose another one.');
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        console.log('Inserting user...');
        const result = await new Promise((resolve, reject) => {
            db.run('INSERT INTO users (username, hashed_password) VALUES (?, ?)', [
                req.body.username,
                hashedPassword
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
