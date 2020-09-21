const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Languages = new Schema(
  {
    lang: {type: String, required: true},
    iso: {type: String, required: true}
});




//Export module
module.exports = mongoose.model('Language', Languages);
