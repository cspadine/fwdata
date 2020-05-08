const validator = require('express-validator');

const Data = require('../models/data');

const async = require('async');


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
exports.data_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Data detail: ' + req.params.id);
};

// Display data create form on GET.
exports.data_create_get = function(req, res, next) {
    res.render('data_form', { title: 'Create Data'});
};

// Handle data create on POST.
exports.data_create_post = [

    validator.body('text', 'Text required').trim().isLength({ min: 1 }),
    validator.sanitizeBody('text').escape(),
    (req, res, next) => {
        const errors = validator.validationResult(req);
        let data = new Data({text: req.body.text});
        
    if (!errors.isEmpty()) {
        res.render('data_form', {title: 'Create Data', data: data, errors: errors.array()});
        return;
        }
    else {
        Data.findOne({ 'text': req.body.text })
            .exec( function(err, found_text ) {
                if (err) { return next(err); }

                if (found_text) {
                    res.redirect(found_test.url);
                } else {
        
                    data.save(function (err) {
                        if (err) {return next(err); }
                        res.render('data_form', {title: 'IT WORKED', data: data, errors: errors.array()});
                    });
                }
            });
        }
    }
];     






// Display data delete form on GET.
exports.data_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Data delete GET');
};

// Handle data delete on POST.
exports.data_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Data delete POST');
};

// Display data update form on GET.
exports.data_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Data update GET');
};

// Handle data update on POST.
exports.data_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Data update POST');
};
