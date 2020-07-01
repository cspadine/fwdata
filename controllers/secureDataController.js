//connects to the mongoose model that contains the users' data
const Data = require('../models/dataSecure');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const getQueryList = require('../helper/queryTerms.js').getQueryList;

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
