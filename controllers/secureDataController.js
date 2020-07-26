//connects to the mongoose model that contains the users' data
const Data = require('../models/dataSecure');
const Lex = require('../models/lexiconSecure')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const getQueryList = require('../helper/queryTerms.js').getQueryList;
const getLexQueryList = require('../helper/lexQueryTerms.js').getLexQueryList;

//import the JSON web token key from the .env file for authetification
const jwtKey = process.env.JWT_SECRET_WORD;

//search in data
exports.search = function(req, res, next){
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  const searchList = getQueryList(req);
  Data.find({$and:searchList}, function(err,q){
       res.render('data_display',{data_list:q, user : user });
   });
};

exports.lexicon_get = function(req, res, next){
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  Lex.find({'user' : req.user.user._id})
  .sort({
    lang: -1,
    morph: 1
  })
  .exec(function (err, list_morph){
  if (err) {return next(err); }
  res.render('lexicon_list', {lexicon:list_morph, user: user});
})
}


exports.lexicon_search = function(req, res, next){
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  const searchList = getLexQueryList(req);
  Lex.find({$and:searchList})
  .sort({
    lang: -1,
    morph: 1
  })
  .exec(function (err, list_morph){
  if (err) {return next(err); }

  res.render('lexicon_list', {lexicon:list_morph, user: user});

})
}

exports.source_get = function(req, res, next){
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  res.render('sources',{user:user})
}

exports.source_post = function(req, res, next){
  res.send('not yet')
}

// Handle data delete on POST.

exports.data_delete_post = function(req, res) {
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  const dataid = req.body.data_delete_id.split(',');
  Data.deleteMany({_id:{$in: dataid}}, function (err,q) {
   if(err) console.log(err);
       Data.find({})
       .exec(function (err, list_data) {
           if (err) { return next(err); }
           res.redirect('/secure/all');
     });

 })}
