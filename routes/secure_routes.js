const data_controller = require('../controllers/secureDataController');
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
const fs = require('fs');
const path = require('path');
const jwtKey = process.env.JWT_SECRET_WORD;
const multer = require('multer');
const morgan = require('morgan');
const crypto = require('crypto');
const rimraf = require("rimraf");
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/user_uploads/');
    },

    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});



router.get('/create', (req, res, next) => {
          const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
          Data.distinct('lang', {'user':req.user.user._id})
          .exec(function (err, lang) {
            if (err) { return next(err); }
          res.render('data_form', { title: 'Create Data', data_list:'', message : '', user: user, lang:lang});
          })
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
                  lang: req.body.lang,
                  });
          addLexemes(data.morph, data.gloss, data.user, data.lang);
      if (!errors.isEmpty()) {
         res.send({data_list: data, errors: errors.array()});
        return;
          }
                else {
          Data.findOne({ 'text': data.text, 'context': data.context, 'lang': data.lang, 'user':data.user})
              .exec( function(err, found_text ) {
                  if (err) { return next(err); }

                  if (found_text) {
                     res.render('data_form', {title: 'Create Data', message : "This sentence is already in the database.", data_list: data, errors: errors.array(), user: user, 'lang': [data.lang]});
                  }
                  else {
                      data.save(function (err) {
                          if (err) {return next(err); }
                          res.render('data_form', {title: 'Create Data', message: "", data_list: data, errors: errors.array(), user: user, 'lang': [data.lang]});
                      });
                  }
              });
    }

});

router.get('/all', (req, res, next) => {
    const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
    Data.find({'user' : req.user.user._id})
    .exec(function (err, list_data) {
        if (err) { return next(err); }
        res.render('data_display', { title: 'Data List', data_list: list_data, user : user });
	});
});

router.post('/search', data_controller.search);


router.post('/upload', (req, res, next) => {
  let uploadedData = [];
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  let finalMorphList = [];
  let finalGlossList = [];
  let finalLangList = [];
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
              finalLangList.push(data.lang)
            }

          } else {
            finalMorphList.push(morphList[j])
            finalGlossList.push(glossList[j])
            finalLangList.push(data.lang)
          }
        }
      }

    data.save(function (err) {
      if (err) {console.log(err)}
      console.log("saved:" + data._id)
    });
  };
  for (let k = 0; k < finalMorphList.length; k++){
  checkForExisting(finalMorphList[k],finalGlossList[k],req.user.user._id, finalLangList[k]).then(output => {
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


// Handle data update on POST.
router.post('/update',(req, res) => {
  const dataToUpdate = req.body.data_change_ids.split(',');
  let updateContent = {};
  if (req.body.text){
    updateContent.text = req.body.text;
  }
  if (req.body.gloss){
    updateContent.gloss = req.body.gloss.split(',');
  }
  if (req.body.morph){
    updateContent.morph = req.body.morph.split(',');
  }
  if (req.body.judgment){
    updateContent.judgment = req.body.judgment;
  }
  if (req.body.context){
    updateContent.context = req.body.context;
  }
  if (req.body.trans){
    updateContent.trans  = req.body.trans;
  }
  if (req.body.notes){
    updateContent.notes = req.body.notes;
  }
  if (req.body.tags){
    updateContent.tags = req.body.tags;
  }
  if (req.body.source){
    updateContent.source = req.body.source;
  }
  if (req.body.ref){
    updateContent.ref = req.body.ref;
  }
  if (req.body.lang){
    updateContent.lang = req.body.lang;
  }
  Data.updateMany({_id: {$in: dataToUpdate}},{$set: updateContent }, function(err, result) {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  })
})







function addLexemes(morph, gloss, user, lang){
  const wToM = wordsToMorphs(morph,gloss);
  if (wToM){
    const morphlist = wToM[0];
    const glosslist = wToM[1];
    for (let i = 0; i < morphlist.length; i++){
      checkForExisting(morphlist[i],glosslist[i], user, lang).then(output => {
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



router.get('/lexicon/:item/:lang', (req, res, next) => {
  const regex = new RegExp(`^${req.params.item}$`, 'i')
  Lex.find({morph: {$regex: regex}, user: req.user.user._id, lang: req.params.lang},'gloss')
  .exec(function (err, list_morph){
    if (err) {return next(err); }
    res.send({lexRes: list_morph});
  })
})


router.post('/exportJSON', (req, res, next) => {
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' )
  const idList = req.body.data_export_id.split(',');
  const d = new Date();
  const n = String(d.getMonth()) + String(d.getDate()) + String(d.getYear())
    + String(d.getHours()) + String(d.getMinutes())
    + String(d.getSeconds()) + String(d.getMilliseconds());;
  const fileName = `public/data_exports/${user}${n}.json`;
  Data.find({_id:{$in : idList}})
  .exec(function (err, list_data) {
    if (err) { return next(err); }
    const objectToWrite = JSON.stringify({sentences: list_data});
    writeToFile(fileName, objectToWrite).then(() => res.download(fileName));
  })
});








function writeToFile(filePath, arr)  {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    file.write(arr);
    file.end();
    file.on("finish", () => { resolve(true); });
    file.on("error", reject);
  });
}







  router.post('/uploadPDF', (req, res) => {
    const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' )
    // 'profile_pic' is the name of our file input field in the HTML form
    let upload = multer({ storage: storage }).single('data_file_PDF');
    upload(req, res, function(err) {
      // req.file contains information of uploaded file
      // req.body contains information of text fields, if there were any

      if (req.fileValidationError) {
          const err = new Error('file Validation Error');
      }
      else if (!req.file) {
          const err = new Error('Please select a file to upload');
      }
      else if (err instanceof multer.MulterError) {
          const err = new Error('Multer Error');
      }
      else if (err) {
          const err = new Error('Error');
      } else {
          console.log('File Uploaded.\n');
          convertPDF()

          }
        })



function convertPDF(){
  console.log('Converting PDFs to images...\n');
  const child_process = require("child_process")
  const child = child_process.spawnSync('python', ["./PDFscripts/PDFtoJPEG.py", './public/user_uploads/'+req.file.filename, user]);
              console.log('PDFs converted to images.\n')
              OCR(child.stdout.toString())
              console.log(child.stdout.toString())
            }





function OCR(docInfo){
       console.log('Extracting text from images...\n(This takes a while....)\n')
       const child_process = require("child_process")
       const child = child_process.spawnSync('python', ["./PDFscripts/OCR.py", docInfo]);
        console.log('Text extracted.\n')
      extractExamples(child.stdout.toString())
      console.log(child.stdout.toString())
  }











function extractExamples(docInfo){
     console.log('Extracting examples from text...\n')
     const child_process = require("child_process")
     const child = child_process.spawnSync('python', ["./PDFscripts/findExInText.py", docInfo]);
     console.log('Examples extracted.\n')
     console.log(child.stdout.toString())
      segmentExamples(child.stdout.toString())
  }

function segmentExamples(docInfo){
      console.log('Segmenting examples...\n')
      const child_process = require("child_process")
      const child = child_process.spawnSync('python', ["./PDFscripts/test.py", docInfo]);
      console.log('Examples segmented.\n')
      console.log(child.stdout.toString())
            res.render('data_PDF_upload', {data_list: child.stdout.toString(), user: user})
            rimraf("PDFscrape/"+user, function(){console.log('file removed.')});
  }


})



router.get('/test', function(req, res) {
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  req.flash('success', 'Flash is back!')
  res.redirect('/');
});






module.exports = router;
