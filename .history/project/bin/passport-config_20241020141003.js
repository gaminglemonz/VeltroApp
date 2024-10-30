const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const crypto = require('crypto');
const LocalStrategy = require('passport-local');

// Adjust this to your actual database path
const dbPromise = open({
    filename: 'chat.db',
    driver: sqlite3.Database,
});

module.exports = function(passport) {
    passport.use(new LocalStrategy(async (username, password, done) => {
        try {
            const db = await dbPromise;
            const row = await db.get('SELECT * FROM users WHERE username = ?', [username]);

            if (!row) {
                return done(null, false, { message: 'Incorrect username.' });
            }

            const salt = Buffer.from(row.salt, 'hex');
            const hashedPassword = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256');

            // Compare stored hashed password with the hashed input password
            const storedHashedPassword = Buffer.from(row.hashed_password);

            if (!crypto.timingSafeEqual(storedHashedPassword, hashedPassword)) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, row);
        } catch (err) {
            console.error('Database error:', err);
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        const db = await dbPromise;
        const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
        done(null, user);
    });
};
