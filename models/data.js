const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DataSchema = new Schema(
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
});

//Virtual for text as array
DataSchema
.virtual('text_array')
.get(function(){
     const array = this.text.split(' ');
});

//Virtual for author's URL
DataSchema
.virtual('url')
.get(function () {
    return '/database/data/' + this._id;
});

//Export module
module.exports = mongoose.model('Data', DataSchema);
