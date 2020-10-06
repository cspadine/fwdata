var express = require('express');
var passport = require('passport');
const bodyParser = require('body-parser');
var Users = require('../models/users');
const jwt = require('jsonwebtoken');
const localStrategy = require('passport-local').Strategy;
var router = express.Router();
const jwtKey = process.env.JWT_SECRET_WORD;


router.get('/', function (req, res) {
    const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );

    res.render('index', { user : user });
});

router.get('/signup', function(req, res) {
    const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
    res.render('signup', {user : user });
});




//new sign up
router.post('/signup', passport.authenticate(
  'signup', {
   session : false,
   failureRedirect : '/users/signup',
   successRedirect : '/',
   failureFlash : true
 }
)
)









router.get('/login', function(req, res) {
          const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
    res.render('login', { user : user,  });
});



router.post('/login', async (req, res, next) => {
  passport.authenticate('login', { session : false }, async (err, user, info) => {     try {
      if(err || !user){
        const error = new Error('An Error occurred')
        return res.redirect('login')
      }
      req.login(user, { session : false }, async (error) => {
        if( error ) return next(error)
        //We don't want to store the sensitive information such as the
        //user password in the token so we pick only the email and id
        const body = { _id : user._id, username: user.username };
        //Sign the JWT token and populate the payload with the user email and id
        const token = jwt.sign({ user : body },jwtKey);
				let cookieOptions = {
    			expires: new Date(Date.now() + 90 * 24 * 60 * 20),
    			httpOnly: true,
					};

        return res
    			.cookie('jwt', token, cookieOptions)
    			.status(200)
    			.redirect('/');

      });     } catch (error) {
      return next(error);
    }
  })(req, res, next) ;
});



router.get('/logout', function(req, res) {
    res.clearCookie('jwt')
    res.redirect('/')
});




router.get('/session', function(req,res){
  const user = jwt.verify(req.cookies.jwt, jwtKey).user.username;
	res.send(console.log(user))
})














module.exports = router;
