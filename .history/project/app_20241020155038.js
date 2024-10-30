require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_here', // Use environment variable for the secret
    resave: false,
    saveUninitialized: true,
    store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', indexRouter);
app.use('/', authRouter);

// Default route
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

// Profile route
app.get('/profile', (req, res) => {
    res.render('profile', { user: req.user });
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    
    // Render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
