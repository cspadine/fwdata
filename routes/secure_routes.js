const validator = require('express-validator');
const ObjectID = require('mongodb').ObjectID;
const express = require('express');
const Data = require('../models/dataSecure');
const Lex = require('../models/lexiconSecure');
const User = require('../models/users');
const helpers = require('../helper/lexiconFormatting.js');
const wordsToMorphs = require('../helper/lexiconFormatting.js').wordsToMorphs;
const morphCleaner = require('../helper/lexiconFormatting.js').morphCleaner;
const checkForExisting = require('../helper/lexiconFormatting.js').checkForExisting;
const async = require('async');
const mongoose = require('mongoose');
const router = express.Router();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const jwtKey = process.env.JWT_SECRET_WORD;
//Let's say the route below is very sensitive and we want only authorized users to have access

//Displays information tailored according to the logged in user
router.get('/profile', (req, res, next) => {
  //We'll just send back the user details and the token
  res.json({
    message : 'You made it to the secure route',
    user : req.user,
    token : req.query.secret_token
  })
});

router.get('/test', (req, res, next) => {
          res.send(req.user.user._id);
});


router.get('/create', (req, res, next) => {
          const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
          res.render('data_form', { title: 'Create Data', data_list:'', message : '', user: user});
});




router.post('/create', (req, res, next) => {
          const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
          const errors = validator.validationResult(req);
          const cleanedMorph = morphCleaner(req.body.morph.split(','));
          let data = new Data({
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
                  language: req.body.lang,
                  });
//          addLexemes(data.morph, data.gloss);
      if (!errors.isEmpty()) {
          res.send({data_list: data, errors: errors.array()});
          return;
          }
                else {
          Data.findOne({ 'text': req.body.text })
              .exec( function(err, found_text ) {
                  if (err) { return next(err); }

                  if (found_text) {
                      res.render('data_form', {title: 'Create Data', message : "This sentence is already in the database.", data_list: data, errors: errors.array(), user: user});
                  } else {
                      data.save(function (err) {
                          if (err) {return next(err); }
                          res.render('data_form', {title: 'Create Data', message: "", data_list: data, errors: errors.array(), user: user});
                      });
                  }
              });
          }
})

router.get('/all', (req, res, next) => {
    const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
    Data.find({'user' : req.user.user._id})
    .exec(function (err, list_data) {
        if (err) { return next(err); }
        res.render('data_display', { title: 'Data List', data_list: list_data, user : user });
	});
});

router.post('/search', (req, res, next) => {
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  const searchList = getQueryList(req);
  Data.find({$and:searchList}, function(err,q){
       res.render('data_display',{data_list:q, user : user });
   });
});


function getQueryList(req){
  let searchList = [{'user':req.user.user._id},];
  let paramsList = ['text','gloss','trans','notes','source','ref','tags'];
  for (let j = 0; j < paramsList.length;j++){
    const currentParam = paramsList[j];
    const queryTermList = req.body[currentParam].split(' ');
    for(let i = 0; i< queryTermList.length; i++){
      const text_regex = new RegExp(queryTermList[i], 'i');
      const textSearchObject = new Object();
      textSearchObject[currentParam] = {$regex: text_regex};
      searchList.push(textSearchObject);}}
  return searchList;
}




router.post('/upload', (req, res, next) => {
  let uploadedData = [];
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  let finalMorphList = [];
  let finalGlossList = [];
  for(let i = 0; i< req.body.length; i++){
    const text = 'text'+i;
    const source = 'source'+i;
    const ref = 'ref'+i;
    const judgment = 'judgment'+i
    const context = 'context' + i;
    const gloss = 'gloss' + i;
    const morph = 'morph' + i;
    const trans = 'trans' + i;
    const notes = 'notes' + i;
    const tags = 'tags' + i;
    const lang = 'lang' + i;
    const cleanedMorph = morphCleaner(req.body[morph].split(','));
    let data = new Data({
            text: req.body[text],
            source: req.body[source],
            ref: req.body[ref],
            judgment: req.body[judgment],
            context: req.body[context],
            morph: cleanedMorph,
            gloss: req.body[gloss].split(','),
            trans: req.body[trans],
            notes: req.body[notes],
            tags: req.body[tags].split(','),
            lang: req.body[lang],
            user: req.user.user._id,
            });
    uploadedData.push(data);
    const wToM = wordsToMorphs(data.morph,data.gloss);
    if (wToM){
      const morphList = wToM[0];
      const glossList = wToM[1];
      for (let j = 0 ; j < morphList.length ; j++){
          if (finalMorphList.includes(morphList[j]) ){
            let alreadyIncludes = false;
            for (let m = 0; m < finalMorphList.length; m++){
              if (finalMorphList[m]===morphList[j] && finalGlossList[m] === glossList[j]){
              alreadyIncludes = true;
              }
            }
            if (alreadyIncludes === false){
              finalMorphList.push(morphList[j])
              finalGlossList.push(glossList[j])
            }

          } else {
            finalMorphList.push(morphList[j])
            finalGlossList.push(glossList[j])
          }
        }
      }

    data.save(function (err) {
      if (err) {console.log(err)}
      console.log("saved:" + data._id)
    });
  };
  for (let k = 0; k < finalMorphList.length; k++){
  checkForExisting(finalMorphList[k],finalGlossList[k],req.user.user._id, "data.lang").then(output => {
    if (output){

      const lexeme = new Lex(output);
      console.log(output)
      lexeme.save();
    }
  }).catch((err)=>{
console.log(err);
})
}
res.render('data_display', {title: 'Sentences Uploaded', user: user, data_list: uploadedData})
});








function addLexemes(morph, gloss){
  const wToM = wordsToMorphs(morph,gloss);
  if (wToM){
    const morphlist = wToM[0];
    const glosslist = wToM[1];
    for (let i = 0; i < morphlist.length; i++){
      checkForExisting(morphlist[i],glosslist[i]).then(output => {
        if (output){
          const lexeme = new Lex(output)
          lexeme.save();
        }
      }).catch((err)=>{
        reject();
    })
  }
}
}



router.get('/lexicon/:item', (req, res, next) => {
  const regex = new RegExp(`^${req.params.item}$`, 'i')
  Lex.find({morph: {$regex: regex}, user: req.user.user._id},'gloss')
  .exec(function (err, list_morph){
    if (err) {return next(err); }
    res.send({lexRes: list_morph});
  })
})

module.exports = router;
