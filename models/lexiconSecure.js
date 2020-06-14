const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SecureLexSchema = new Schema(
  {
    morph: {type: String, required: true},
    gloss: {type: String, required: true},
    lang: {type: String},
    user: {type: String, required: true},
});

//Virtual for text as array


//Export module
module.exports = mongoose.model('SecureLex', SecureLexSchema);
