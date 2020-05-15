const validator = require('express-validator');


const Data = require('../models/data');
const Lang = require('../models/languages')

const async = require('async');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

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
      for(let i = 0; i< req.body.length; i++){
        const text = 'text'+i;
        const source = 'source'+i;
        const ref = 'ref'+i;
        const judgment = 'judgment'+i
        const context = 'context' + i;
        const gloss = 'gloss' + i;
        const trans = 'trans' + i;
        const notes = 'notes' + i;
        const tags = 'tags' + i;
        let data = new Data({
                text: req.body[text],
                source: req.body[source],
                ref: req.body[ref],
                judgment: req.body[judgment],
                context: req.body[context],
                gloss: req.body[gloss].split(','),
                trans: req.body[trans],
                notes: req.body[notes],
                tags: req.body[tags].split(',')
                });

//          {
// else {
                    data.save();
                  }
                    res.render('data_form', {title: 'It worked'});
//                      function (err) {
//                        if (err) {return next(err); }
//                        res.render('data_form', {title: 'IT WORKED', data: data});
//                    });
//                }
//            });
//        }
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
        let data = new Data({
                text: req.body.text,
                source: req.body.source,
                ref: req.body.ref,
                judgment: req.body.judgment,
                context: req.body.context,
                gloss: req.body.gloss.split(','),
                morph: req.body.morph.split(','),
                trans: req.body.trans,
                notes: req.body.notes,
                tags: req.body.tags.split(' ')
                });

    if (!errors.isEmpty()) {
        res.render('data_form', {title: 'Create Data', data_list: data, errors: errors.array()});
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
