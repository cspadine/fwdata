var express = require('express');
var passport = require('passport');
const bodyParser = require('body-parser');
var Users = require('../models/users');
const jwt = require('jsonwebtoken');
var router = express.Router();



router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

router.get('/signup', function(req, res) {
    res.render('signup', { });
});




//new sign up
router.post('/signup', passport.authenticate('signup', { session : false }) , async (req, res, next) => {
  res.json({
    message : 'Signup successful',
    user : req.user
  });
});






router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

//router.post('/login', passport.authenticate('local'), function(req, res) {
//    res.redirect('/');
//});



router.post('/login', async (req, res, next) => {
  passport.authenticate('login', async (err, user, info) => {     try {
      if(err || !user){
        const error = new Error('An Error occurred')
        return next(error);
      }
      req.login(user, { session : false }, async (error) => {
        if( error ) return next(error)
        //We don't want to store the sensitive information such as the
        //user password in the token so we pick only the email and id
        const body = { _id : user._id, username: user.username };
        //Sign the JWT token and populate the payload with the user email and id
        const token = jwt.sign({ user : body },'top_secret');
				let cookieOptions = {
    			expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000 ),
    			httpOnly: true,
					};

        return res
    			.cookie('jwt', token, cookieOptions)
    			.status(200)
    			.json({
        		msg: 'Successfully logged in',
    		});

      });     } catch (error) {
      return next(error);
    }
  })(req, res, next) ;
});



router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});



router.get('/session', function(req,res){
	res.send(console.log(req.headers))
})




const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, 'top_secret', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};
















module.exports = router;
