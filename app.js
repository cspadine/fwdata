const express = require('express');


//const createError = require('http-errors');

//access global variables in a .env file
const dotenv = require("dotenv");
//use file and directory paths
const path = require('path');
//log requestest and responses
const logger = require('morgan');
//ecryption for passwords
const bcrypt = require('bcryptjs');
//create and store session data
const session = require('express-session');
//compresses response bodies
const compression = require('compression');
//secruity for HTTP respnse headers
const helmet = require('helmet');
//manage CORS
const cors = require('cors');
//handle authentification
const passport = require('passport');
//autheticates users with username (email) and password
const localStrategy = require('passport-local').Strategy;
//show flash messages
const flash = require('connect-flash');
//parses incoming request bodies
const bodyParser = require('body-parser');
//parses cookies
const cookieParser = require('cookie-parser');
//handles file uploads
const multer = require('multer');
//creates tokens to validate users
const jwt = require('jsonwebtoken');



//configures enviroment variables.
dotenv.config();
const jwtKey = process.env.JWT_SECRET_WORD;
const cookieKey = process.env.COOKIES_SECRET_WORD;


//creates an new instance of express
const app = express();

//connect to routers
const indexRouter = require('./routes/index');
const databaseRouter = require('./routes/database');
const usersRouter = require('./routes/users');
const secureRoute = require('./routes/secure_routes');




app.use(cookieParser(cookieKey));
app.use(session({ cookie: { maxAge: 60000 },
                  secret: cookieKey,
                  resave: true,
                  saveUninitialized: true}));


//configures flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  next();
});

//connect middleware to app
app.use(helmet());
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json())


//connect routes to app
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/database', databaseRouter);
//secure routes require a password and return data specific to the user.
app.use('/secure', passport.authenticate('jwt', { session : false, failureRedirect : '/users/login' }), secureRoute );



//mongoose connection
const mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, {useNewUrlParser:true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.promise = global.Promise;

// ejs view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


//require helper functions for login and signup
require('./auth/auth');









// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
//   set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

//   render the error page
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  res.status(err.status || 500);
  res.render('error', {user:user});
});



module.exports = app;
