var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
  res.redirect('/database');
});



router.get('/name', callName);

function callName(req, res) {

    // Use child_process.spawn method from
    // child_process module and assign it
    // to variable spawn
    var spawn = require("child_process").spawn;

    // Parameters passed in spawn -
    // 1. type_of_script
    // 2. list containing Path of the script
    //    and arguments for the script

    // E.g : http://localhost:3000/name?firstname=Mike&lastname=Will
    // so, first name = Mike and last name = Will
    var process = spawn('python',["./hello.py",
                            req.query.firstname,
                            req.query.lastname] );

    // Takes stdout data from script which executed
    // with arguments and send this data to res object
    process.stdout.on('data', function(data) {
        res.send(data.toString());
    } )
}



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
