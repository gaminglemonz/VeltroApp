const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// Dummy user database
const users = [
  {
    id: 1,
    username: 'john',
    password: '$2b$10$X.fyRJ/jnB4Qzq/eNc./fuyKmQiE3tXZ9DDhP5wbk7.tTJGfxycE.' // 'changeit'
  }
];

module.exports = function(passport) {
  passport.use(new LocalStrategy((username, password, done) => {
    const user = users.find(u => u.username === username);
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    });
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    const user = users.find(u => u.id === id);
    done(null, user);
  });
};
