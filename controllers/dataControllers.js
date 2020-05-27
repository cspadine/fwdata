const validator = require('express-validator');
const ObjectID = require('mongodb').ObjectID;

const Data = require('../models/data');
const Lang = require('../models/languages')
const Lex = require('../models/lexicon')

const async = require('async');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const mongoose = require('mongoose');

exports.index = function(req, res) {
    async.parallel({
	data_count: function(callback) {
            Data.countDocuments({}, callback);
            }
        },
        function(err, results) {
            res.render('index', {title:'FWdata', error:err, data: results});
    });
};



// Display list of all data.
exports.data_list = function(req, res, next) {
    Data.find({})
    .exec(function (err, list_data) {
        if (err) { return next(err); }
        res.render('data_list', { title: 'Data List', data_list: list_data });
	});
};




// Display detail page for a specific data.
exports.data_detail = function(req, res, next) {
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
        res.render('data_detail', {title: results.data.text, data: results.data});
    });
};




// Display data upload form on GET.
exports.data_upload_get = function(req, res, next) {
    res.render('data_upload', {title: 'Upload Data'})
};


//Handle data upload on POST.
exports.data_upload_post =
    (req, res, next) => {
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
    res.render('data_upload', {title: 'Sentences Uploaded'})
};







// Display data create form on GET.
exports.data_create_get = function(req, res, next) {
    res.render('data_form', { title: 'Create Data', data_list:''});
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
    validator.sanitizeBody('source').escape(),
    validator.sanitizeBody('text').escape(),
    validator.sanitizeBody('ref').escape(),
    validator.sanitizeBody('judgment').escape(),
    validator.sanitizeBody('context').escape(),
    validator.sanitizeBody('gloss').escape(),
    validator.sanitizeBody('trans').escape(),
    validator.sanitizeBody('notes').escape(),
    validator.sanitizeBody('tags').escape(),
    (req, res, next) => {
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
                    res.redirect('error');
                } else {
                    data.save(function (err) {
                        if (err) {return next(err); }
                        res.render('data_form', {title: 'Create Data', data_list: data, errors: errors.array()});
                    });
                }
            });
        }
    }
];


//strip punctuation and leading/trailing spaces from morph row
function morphCleaner(array){
  let arrayCleaned = [];
  const regex = /\b[^. ]?[\w-+~.]+[^. ]?\b/g;
    for (let i = 0; i < array.length ; i++){
      const lowercase = array[i].toLowerCase();
      const cleanedText = lowercase.replace(/[.?*/()&!,"']+$/g,'').replace(/^[.?*&/()!,"']+/g,'').replace(/\s/g,'');
      arrayCleaned.push(cleanedText)
    }
  return arrayCleaned;
}

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
function wordsToMorphs(morph,gloss){
  if (morph.length == gloss.length){
    let morphEndArray = [];
    let glossEndArray = [];
    for (let i = 0 ; i < morph.length; i++){
      const morphSubArray = morph[i].split(/[-~+()\/\[\]]/);
      const glossSubArray = gloss[i].split(/[-~+()\/\[\]]/);
      if (morphSubArray.length == glossSubArray.length) {
        for (let j = 0 ; j < morphSubArray.length ; j++){
          morphEndArray.push(morphSubArray[j])
          glossEndArray.push(glossSubArray[j])
        };
      };
    };
  const morphAndGloss = [morphEndArray, glossEndArray];
  return morphAndGloss
  } else {
    console.log("lengths don't match!")
    return null
  }
};

//checks whether an entry already exists for this combination of
//glosses and morphs
function checkForExisting(morph,gloss){
  let lexeme = {
            morph : morph,
            gloss : gloss
          };
  return new Promise (function (resolve, reject){
    Lex.findOne(lexeme).then(data =>{
      if (data) {
        resolve(null)
      } else {
        resolve(lexeme)
      }
    }).catch((err)=>{
      reject();
    })
})
}



//














// Display data delete form on GET.
exports.data_delete_get = function(req, res, next) {
    Data.find({})
    .exec(function (err, list_data) {
        if (err) { return next(err); }
        res.render('data_delete', { title: 'Data Delete', data_list: list_data });
	});
};




// Handle data delete on POST.

exports.data_delete_post = function(req, res) {
  const dataid = req.body.dataid.split(',');
  Data.deleteMany({_id:{$in: dataid}}, function (err,q) {
   if(err) console.log(err);
       Data.find({})
       .exec(function (err, list_data) {
           if (err) { return next(err); }
           res.render('data_delete', { title: 'Data Delete', data_list: list_data });
     });

 })}






exports.data_search_get = function(req, res){
  res.render('data_search',{data_list:''});
};

exports.data_search_post = function(req, res){
  const searchList = getQueryList(req);
  Data.find({$and:searchList}, function(err,q){
       res.render('data_search',{data_list:q});
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
    res.send('NOT IMPLEMENTED: Data update POST');
};




// Display list of all data.
exports.language_list = function(req, res, next) {
    Data.find({})
    .exec(function (err, list_data) {
        if (err) { return next(err); }
        res.render('test', { title: 'Data List', data_list: list_data });
	});
};

//Display all lexical items
exports.lexicon_list_get = function(req, res, next){
  Lex.find({})
  .exec(function (err, list_lex) {
    if (err) { return next(err); }
      res.render('lexicon_list', {title: 'Lexicon', lex:  list_lex });
});
}

exports.lexicon_list_dups = function(req, res, next) {
  aggregateFunc().then(outcome => res.send(outcome))

}


function aggregateFunc ()
  { return new Promise(function (resolve, reject){
    Lex.aggregate([
        { $group: {
          _id: { firstField: "$morph", secondField: "$gloss" },
          uniqueIds: { $addToSet: "$_id" },
          count: { $sum: 1 }
        }},
        { $match: {
          count: { $gt: 1 }
        }}
      ], function (err, result) {
        if (err) {
          console.log(err);
          reject();
        }
        let idList = [];
        for (let i = 0 ; i < result.length ; i++){
            result[i]['uniqueIds'].shift();
            idList.push(...result[i]['uniqueIds'])
        }
        idList.map(String);
        console.log(idList);
        resolve(idList)
      });
      });

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
