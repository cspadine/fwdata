const validator = require('express-validator');
const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;

const Data = require('../models/data');
const Lang = require('../models/languages');
const Lex = require('../models/lexicon');
const User = require('../models/users');

const async = require('async');
const mongoose = require('mongoose');


exports.login_get = function(req, res, next) {
    res.render('login')
};

exports.login_post = passport.authenticate('login', {
  	successRedirect: '/database',
    failureRedirect: '/',
		failureFlash : true
  	}
  )
