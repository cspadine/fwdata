const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LexSchema = new Schema(
  {
    morph: {type: String, required: true},
    gloss: {type: String},
});

//Virtual for text as array


//Export module
module.exports = mongoose.model('Lex', LexSchema);
