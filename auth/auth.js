

const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const Users = require('../models/users');
const jwtKey = process.env.JWT_SECRET_WORD;
//Create a passport middleware to handle user registration
passport.use('signup', new localStrategy({
  usernameField : 'username',
  passwordField : 'password'
}, async (username, password, done) => {
    try {
      const existingUser = await Users.findOne({ username });
      if( existingUser ){
        //If the user isn't found in the database, return a message
        return done(null, false, { message : 'A user with that name already exists.'});
      } else {
      //Save the information provided by the user to the the database
      const user = await Users.create({ username, password });
      //Send the user information to the next middleware
      return done(null, user);
    }} catch (error) {
      done(error);
    }
}));

//Create a passport middleware to handle User login
passport.use('login', new localStrategy({
  usernameField : 'username',
  passwordField : 'password'
}, async (username, password, done) => {
  try {
    //Find the user associated with the email provided by the user
    const user = await Users.findOne({ username });
    if( !user ){
      //If the user isn't found in the database, return a message
      return done(null, false, { message : 'User not found'});
    }
    //Validate password and make sure it matches with the corresponding hash stored in the database
    //If the passwords match, it returns a value of true.
    const validate = await user.isValidPassword(password);
    if( !validate ){
      return done(null, false, { message : 'Wrong Password'});
    }
    //Send the user information to the next middleware
    return done(null, user, { message : 'Logged in Successfully'});
  } catch (error) {
    return done(error);
  }
}));




















const JWTstrategy = require('passport-jwt').Strategy;
//We use this to extract the JWT sent by the user
const ExtractJWT = require('passport-jwt').ExtractJwt;

//This verifies that the token sent by the user is valid
passport.use(new JWTstrategy({
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: jwtKey,
  },
  (jwtPayload, done) => {
    if (Date.now() > jwtPayload.expires) {
      return done('jwt expired');
    }

    return done(null, jwtPayload);
  }
));
