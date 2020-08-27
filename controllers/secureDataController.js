//connects to the mongoose model that contains the users' data
const Data = require('../models/dataSecure');
const Lex = require('../models/lexiconSecure')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const getQueryList = require('../helper/queryTerms.js').getQueryList;
const getLexQueryList = require('../helper/lexQueryTerms.js').getLexQueryList;
const validator = require('express-validator');
const morphCleaner = require('../helper/lexiconFormatting.js').morphCleaner;
const CFEloop = require('../helper/lexiconFormatting.js').CFEloop;
const wordsToMorphs = require('../helper/lexiconFormatting.js').wordsToMorphs;
const checkForExisting = require('../helper/lexiconFormatting.js').checkForExisting;
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


 // Display detail page for a specific lexeme.
 exports.lexeme_detail = function(req, res) {
     res.send('NOT IMPLEMENTED: Lexeme detail: ' + req.params.id);

 };


//Add a new sentence and the morphemes that compose it
 exports.create_post = function(req,res) {

   const user = ( req.cookies.jwt ?
     jwt.verify(req.cookies.jwt, jwtKey).user.username : '' ); //user validation
   const errors = validator.validationResult(req);
   const cleanedMorph = morphCleaner(req.body.morph.split(',')); //strip trailing
   //and leading punctuation
   let data = new Data({ //create new Data object
           text: req.body.text,
           source: req.body.source,
           ref: req.body.ref,
           judgment: req.body.judgment,
           context: req.body.context,
           gloss: req.body.gloss.split(','),
           morph: cleanedMorph,
           trans: req.body.trans,
           notes: req.body.notes,
           tags: req.body.tags.split(' '),
           user: req.user.user._id,
           lang: req.body.lang,
           });
           console.log(data)
    addLexemes(data.morph, data.gloss, data.user, data.lang) //add lexemes to db
    .then((output) => data.morpheme_ids = output)//add lexeme ids to the Data object
    .then(()=> {
      if ( !errors.isEmpty() ) {
          res.send({data_list: data, errors: errors.array()});
       return;
     }  else {
       Data.findOne({ 'text': data.text, 'context': data.context, 'lang': data.lang, 'user':data.user})
           .exec( function(err, found_text ) {
               if (err) { return next(err); }

               if (found_text) {//display result
                  res.render('data_form', {title: 'Create Data',
                  message : "This sentence is already in the database.",
                  data_list: data, errors: errors.array(),
                  user: user, 'lang': [data.lang]});
               }
               else {
                   data.save(function (err) {//save data and display result
                       if (err) {return next(err); }
                       res.render('data_form', {title: 'Create Data',
                       message: "", data_list: data,
                       errors: errors.array(), user: user,
                       'lang': [data.lang]});
                   });
               }
           });
    }
  })
  };








 //addLexemes formats the morphemes and glosses into lexeme objects,
 //checks if they already exist in the lexicon,
 //if not, adds them to the lexicon, and then returns a list of the
 //ids of the lexemes that the sentence contains.
 const addLexemes = function(morph, gloss, user, lang){
   return new Promise((resolve, reject) => {
   let wToM = [] //will contain an array of morphs and an array of glosses
   //wordsToMorphs splits words and glosses into morphemes and checks that they
   //have an equal number of elements
    try{
      wToM = wordsToMorphs(morph,gloss);
       }
     catch (err) {
       console.log(err)
     }
     //if wordsToMorphs successfully returns a value, then proceed to looping
     //through the morphemes it contains (format of wToM is [[<morphemes>],[<glosses>]])
     if (wToM.length != 0){
       const morphlist = wToM[0];
       const glosslist = wToM[1];
       //loop through morphemes in morphlist
 CFEloop(morph, gloss, user, lang).then((output) => resolve(output)).catch((e)=> console.log(e))
  }
 })
  }