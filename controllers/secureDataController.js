//connects to the mongoose model that contains the users' data
const Data = require('../models/dataSecure');
const Lex = require('../models/lexiconSecure')
const Lang = require('../models/languages.js')
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
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/user_uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  })


exports.exportText = function(req, res, next){
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' )
  const idList = req.body.data_export_id_plaintext.split(',');
  const d = new Date();
  const n = String(d.getMonth()) + String(d.getDate()) + String(d.getYear())
    + String(d.getHours()) + String(d.getMinutes())
    + String(d.getSeconds()) + String(d.getMilliseconds());;
  const fileName = `public/data_exports/${user}${n}.txt`;
Data.find({_id:{$in : idList}}, {text:1, morph:1, gloss:1, trans:1, notes:1, tags:1, lang:1, source:1, judgment:1,ref:1,context:1})
.exec(function(err, list_data){
  if (err){ return next(err); }
    let data_to_write =''
    for (let i = 0; i < list_data.length ; i++){
          data_to_write += list_data[i]['context'];
          data_to_write += '\n';
          data_to_write += list_data[i]['judgment']+list_data[i]['text'];
          data_to_write += '\n';
          data_to_write += list_data[i]['morph'];
          data_to_write += '\n';
          data_to_write += list_data[i]['gloss'];
          data_to_write += '\n';
          data_to_write += '"'+list_data[i]['trans']+'"';
          data_to_write += '\n';
          data_to_write += '\n';
    }
    writeToFile(fileName, data_to_write).then(() => res.download(fileName));
  }
)
}







exports.exportTB = function(req, res, next){
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' )
  const idList = req.body.data_export_id_toolbox.split(',');
  const d = new Date();
  const n = String(d.getMonth()) + String(d.getDate()) + String(d.getYear())
    + String(d.getHours()) + String(d.getMinutes())
    + String(d.getSeconds()) + String(d.getMilliseconds());;
  const fileName = `public/data_exports/${user}${n}.txt`;
Data.find({_id:{$in : idList}}, {text:1, morph:1, gloss:1, trans:1, notes:1, tags:1, lang:1, source:1, judgment:1,ref:1,context:1})
.exec(function(err, list_data){
  if (err){ return next(err); }
    let data_to_write =''
    for (let i = 0; i < list_data.length ; i++){
          data_to_write +=  '\\ref '+list_data[i]['_id'];
          data_to_write += '\n';
          data_to_write += '\\iso '+list_data[i]['lang'];
          data_to_write += '\n'
          data_to_write += '\\ct '+list_data[i]['context'];
          data_to_write += '\n';
          data_to_write += '\\jg '+list_data[i]['judgment']
          data_to_write += '\n';
          data_to_write += '\\tx '+list_data[i]['text'];
          data_to_write += '\n';
          data_to_write += '\\mb '+list_data[i]['morph'].join(' ');
          data_to_write += '\n';
          data_to_write += '\\gl '+list_data[i]['gloss'].join(' ');
          data_to_write += '\n';
          data_to_write += '\\ft '+list_data[i]['trans'];
          data_to_write += '\n';
          data_to_write += '\\nt '+list_data[i]['notes'];
          data_to_write += '\n';
          data_to_write += '\\tg '+list_data[i]['tags'];
          data_to_write += '\n';
          data_to_write += '\\sc '+list_data[i]['source'];
          data_to_write += '\n';
          data_to_write += '\\rf '+list_data[i]['ref'];
          data_to_write += '\n';
          data_to_write += '\n';
    }
    writeToFile(fileName, data_to_write).then(() => res.download(fileName));
  }
)
}









//get all data
exports.get_all = function(req, res, next){
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  Data.find({'user' : req.user.user._id})
  .exec(function (err, list_data) {
      if (err) { return next(err); }
      res.render('data_display', { title: 'Data List', data_list: list_data, user : user });
});
}

//render the data creation page
exports.get_create = function(req, res, next){
        const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
        Data.distinct('lang', {'user':req.user.user._id})
        .exec(function (err, lang) {
        if (err) { return next(err); }
          const promises = []
            for (let i = 0; i < lang.length; i++){
              promises.push(Lang.findOne({"iso":lang[i]}, {lang:1, iso:1}))
            }
            Promise.all(promises)
              .then((res) => {
                  const lang_objs = res;
                  return lang_objs;
                  }
                ).then((lang_objs) => res.render('data_form', { title: 'Create Data', data_list:'', message : '', user: user, lang:lang_objs}))
    .catch((e) => {
        throw e
    });
          })
      };



      function writeToFile(filePath, arr)  {
        return new Promise((resolve, reject) => {
          const file = fs.createWriteStream(filePath);
          file.write(arr);
          file.end();
          file.on("finish", () => { resolve(true); });
          file.on("error", reject);
        });
      }




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
       Data.find({'user' : req.user.user._id})
       .exec(function (err, list_data) {
           if (err) { return next(err); }
           res.render('data_display', { title: 'Data List', data_list: list_data, user : user });
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
                       if (err) {res.render(
                         'data_form',
                            {
                              title: 'Create Data',
                              message: "Data could not be saved. Some part of your \
                              data is not in the correct format.",
                              data_list: data,
                              errors: errors.array(),
                              user: user,
                              'lang': [data.lang]
                            }
                       )
                     } else {
                          res.render(
                            'data_form', {
                              title: 'Create Data',
                              message: "Saved!",
                              data_list: data,
                              errors: errors.array(),
                              user: user,
                              'lang': [data.lang]
                            }
                          );
                     }
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
 CFEloop(morphlist, glosslist, user, lang).then((output) => resolve(output)).catch((e)=> console.log(e))
  }
 })
  }


exports.languages_get = function(req,res){
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' ); //user validation
  //let langauge = 'req.params.lang';
  console.log(req.params.lang);
  let language = new RegExp(['(^| )',req.params.lang].join(''), "i");
  console.log(language);
  Lang.find({'lang':{$regex: language}}, function(err,q){
        if (err) console.log(err);
        console.log(q)
       res.send(q);

   });

}




exports.iso_get = function(req,res){
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' ); //user validation
  //let langauge = 'req.params.lang';
  console.log(req.params.lang);
  let language = new RegExp(['(^| )',req.params.lang].join(''), "i");
  console.log(language);
  Lang.find({'iso':{$regex: language}}, function(err,q){
        if (err) console.log(err);
        console.log(q)
       res.send(q);

   });

}
