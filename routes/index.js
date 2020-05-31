var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
  res.redirect('/database');
});







	/* GET login page. */
//router.get('/login', function(req, res) {
    	// Display the Login page with any flash message, if any
//		res.send('login');
//	});



	/* Handle Login POST */
//	router.post('/login', passport.authenticate('login', {
//		successRedirect: '/home',
//		failureRedirect: '/',
//		failureFlash : true
//	}));

	/* GET Registration Page */
//	router.get('/signup', function(req, res){
//		res.render('register',{message: req.flash('message')});
//	});

	/* Handle Registration POST */
//	router.post('/signup', passport.authenticate('signup', {
//		successRedirect: '/home',
//		failureRedirect: '/signup',
//		failureFlash : true
//	}));

	/* GET Home Page */
//	router.get('/home', isAuthenticated, function(req, res){
//		res.render('home', { user: req.user });
//	});

	/* Handle Logout */
//	router.get('/signout', function(req, res) {
//		req.logout();
//		res.redirect('/');
//	});

//	return router;
//}
module.exports = router;
