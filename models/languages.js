const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LangSchema = new Schema(
  {
    lang: {type: String},
});

//Virtual for text as array


//Virtual for author's URL


//Export module
module.exports = mongoose.model('Lang', LangSchema);
