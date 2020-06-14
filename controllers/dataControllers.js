const validator = require('express-validator');
const ObjectID = require('mongodb').ObjectID;

const Data = require('../models/data');
const Lang = require('../models/languages');
const Lex = require('../models/lexicon');
const User = require('../models/users');

const helpers = require('../helper/lexiconFormatting.js');
const wordsToMorphs = require('../helper/lexiconFormatting.js').wordsToMorphs;
const morphCleaner = require('../helper/lexiconFormatting.js').morphCleaner;
const checkForExisting = require('../helper/lexiconFormatting.js').checkForExisting;
const async = require('async');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const jwtKey = process.env.JWT_SECRET_WORD;








exports.index = function(req, res) {
    const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
    async.parallel({
	data_count: function(callback) {
            Data.countDocuments({}, callback);
            }
        },
        function(err, results) {
            res.render('index', {title:'FWdata', error:err, data: results, user: user});
    });
};



// Display list of all data.
//exports.data_list = function(req, res, next) {
//    const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
//    Data.find({})
//    .exec(function (err, list_data) {
//        if (err) { return next(err); }
//        res.render('data_list', { title: 'Data List', data_list: list_data, user: user });
//	});
//



// Display detail page for a specific data.
exports.data_detail = function(req, res, next) {
    const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
    async.parallel({
        data: function(callback) {

            Data.findById(req.params.id)
                .exec(callback);
            },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.data==null) {// No results.
                const err = new Error('Book not found');
                err.status = 404;
                return next(err);
        }
        res.render('data_detail', {title: results.data.text, data: results.data, user: user});
    });
};




// Display data upload form on GET.
exports.data_upload_get = function(req, res, next) {
    const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
    res.render('data_upload', {title: 'Upload Data', user: user})
};


//Handle data upload on POST.
exports.data_upload_post =
    (req, res, next) => {
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
                tags: req.body[tags].split(',')
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
                    console.log('found match:', finalMorphList[m], finalGlossList[m]);
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
          for (let l = 0; l < finalMorphList.length ; l++){
            console.log(l, finalMorphList[l], finalGlossList[l])
          }
      });
    };
    for (let k = 0; k < finalMorphList.length; k++){
      checkForExisting(finalMorphList[k],finalGlossList[k]).then(output => {
        if (output){
          const lexeme = new Lex(output)
          lexeme.save();
        }
      }).catch((err)=>{
        reject();
    })
    }
    res.render('data_display', {title: 'Sentences Uploaded', user: user, data_list: uploadedData})
};







// Display data create form on GET.
exports.data_create_get = function(req, res, next) {
    const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
    res.render('data_form', { title: 'Create Data', data_list:'', message : '', user: user});
};



// Handle data create on POST.
exports.data_create_post = [

    validator.body('text', 'Text required').trim().isLength({ min: 1 }),
    validator.body('source').trim(),
    validator.body('ref').trim(),
    validator.body('judgment').trim(),
    validator.body('context').trim(),
    validator.body('gloss').trim(),
    validator.body('trans').trim(),
    validator.body('notes').trim(),
    (req, res, next) => {
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
                tags: req.body.tags.split(' ')
                });
        addLexemes(data.morph, data.gloss);
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
    }
];





exports.lexicon_add = function (req, res, next) {
  const morph = ['beep','bloop','bip'];
  const gloss = ['beep','bloop','bip'];
  addLexEntry(morph,gloss);
}




exports.lexicon_format = function(req, res, next){
const morph = req.morph;
const gloss = req.gloss;
const wToM = wordsToMorphs(morph,gloss);
const morphlist = wToM[0];
const glosslist = wToM[1];
for (let i = 0; i < morphlist.length ; i++){
  checkForExisting(morphlist[i],glosslist[i]).then(output => {
    if (output){
      const lexeme = new Lex(output)
      lexeme.save();
    }
  })
}
}

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





//takes an array of words and an array of glosses,
//makes sure that the lengths match, and converts it into an array
//where the individual morphemes are the items.




//



exports.data_export = function(req, res, next){
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






// Display data delete form on GET.
exports.data_list = function(req, res, next) {
    const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
    Data.find({})
    .exec(function (err, list_data) {
        if (err) { return next(err); }
        res.render('data_display', { title: 'Data Delete', data_list: list_data, user: user });
	});
};




// Handle data delete on POST.

exports.data_delete_post = function(req, res) {
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  const dataid = req.body.data_delete_id.split(',');
  Data.deleteMany({_id:{$in: dataid}}, function (err,q) {
   if(err) console.log(err);
       Data.find({})
       .exec(function (err, list_data) {
           if (err) { return next(err); }
           res.redirect('/database/data');
     });

 })}






exports.data_search_get = function(req, res){
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  res.render('data_search',{data_list:'', user: user});
};

exports.data_search_post = function(req, res){
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  const searchList = getQueryList(req);
  Data.find({$and:searchList}, function(err,q){
       res.render('data_display',{data_list:q, user : user });
   });
};

function getQueryList(req){
  let searchList = [];
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







// Display data update form on GET.
exports.data_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Data update GET');
};

// Handle data update on POST.
exports.data_update_post = function(req, res) {
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
};




// Display list of all data.
exports.language_list = function(req, res, next) {
    const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
    Data.find({})
    .exec(function (err, list_data) {
        if (err) { return next(err); }
        res.render('test', { title: 'Data List', data_list: list_data, user: user});
	});
};

//Display all lexical items
exports.lexicon_list_get = function(req, res, next){
  const user = ( req.cookies.jwt ? jwt.verify(req.cookies.jwt, jwtKey).user.username : '' );
  Lex.find({})
  .exec(function (err, list_lex) {
    if (err) { return next(err); }
      res.render('lexicon_list', {title: 'Lexicon', lex:  list_lex, user: user });
});
}

exports.lexicon_list_dups = function(req, res, next) {
  aggregateFunc().then(outcome => res.send(outcome))

}








exports.lexicon_delete = function(req, res, next) {
  aggregateFunc().then(outcome => Lex.deleteMany({_id: {$in: outcome}}, function (err,q) {
   if(err) console.log(err);
     }))
}















exports.lexicon_item = function(req, res, next) {
  const regex = new RegExp(`^${req.params.item}$`, 'i')
  Lex.find({morph: {$regex: regex}},'gloss')
  .exec(function (err, list_morph){
    if (err) {return next(err); }
    res.send({lexRes: list_morph});
  })
}
