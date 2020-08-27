const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SecureDataSchema = new Schema(
  {
    source: {type: String},
    ref: {type: String},
    judgment:
       {type: String},
    context: {type: String},
    text: {type: String, required: true},
    morph: {type: Array},
    gloss: {type: Array},
    trans: {type: String},
    notes: {type: String},
    tags: {type: Array},
    lang: {type: String},
    user: {type: String, required: true},
    morpheme_ids: {type: Array},
});

//Virtual for text as array
SecureDataSchema
.virtual('text_array')
.get(function(){
     const array = this.text.split(' ');
});

//Virtual for author's URL
SecureDataSchema
.virtual('url')
.get(function () {
    return '/secure/data/' + this._id;
});

//Export module
module.exports = mongoose.model('SecureData', SecureDataSchema);
