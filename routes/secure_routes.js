const validator = require('express-validator');
const ObjectID = require('mongodb').ObjectID;
const express = require('express');
const Data = require('../models/dataSecure');
const Lang = require('../models/languages');
const Lex = require('../models/lexicon');
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
          res.render('data_form', { title: 'Create Data', data_list:'', message : ''});
});



router.post('/create', (req, res, next) => {
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
                      res.render('data_form', {title: 'Create Data', message : "This sentence is already in the database.", data_list: data, errors: errors.array()});
                  } else {
                      data.save(function (err) {
                          if (err) {return next(err); }
                          res.render('data_form', {title: 'Create Data', message: "", data_list: data, errors: errors.array()});
                      });
                  }
              });
          }
})




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


module.exports = router;
