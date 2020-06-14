var createError = require('http-errors');
const dotenv = require("dotenv");
var express = require('express');
var path = require('path');
var logger = require('morgan');
const bcrypt = require('bcryptjs');
const expressSession = require('express-session');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
var flash = require('connect-flash');
var localStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
dotenv.config();
require('./auth/auth');
//connect to routers
const indexRouter = require('./routes/index');
const databaseRouter = require('./routes/database');
const usersRouter = require('./routes/users');


const app = express();
app.use(cookieParser());
app.use(helmet());
app.use(require('./routes'));

app.use(passport.initialize());
app.use(passport.session());
const Users = require('./models/users')

const jwtKey = process.env.JWT_SECRET_WORD;





//mongoose connection
const mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, {useNewUrlParser:true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.promosise = global.Promise;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(cors());
app.use(flash());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/database', databaseRouter);
const secureRoute = require('./routes/secure_routes');
app.use('/secure', passport.authenticate('jwt', { session : false, failureRedirect : '/users/login' }), secureRoute );
app.use(bodyParser.urlencoded({ extended : false }));
const jwt = require('jsonwebtoken');

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
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  res.status(err.status || 500);
  res.render('error', {user:user});
});

module.exports = app;
