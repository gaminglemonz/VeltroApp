require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');

app.use(session({
  secret: 'eea44a2daff7f3e3107209aa2718bdb30de080f09eecdfa7bd61523202904072',
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/profile', (req, res) => {
  res.render('profile', { user: req.user });
});

var SQLiteStore = require('connect-sqlite3')(session)

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var app = express();

app.locals.pluralize = require('pluralize');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));
app.use(passport.authenticate('session'))

app.use('/', indexRouter);
app.use('/', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
