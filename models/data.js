const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DataSchema = new Schema(
  {
    source: {type: String},
    ref: {type: String},
    judgement: 
       {
        type: String,
        enum: ["","*", "?", "#", "??", "##"],
        default: "",
        },
    context: {type: String},
    text: {type: String, required: true},
    morph: {type: Array},
    gloss: {type: Array},
    trans: {type: String},
    notes: {type: String},
    tags: {type: Array},
});

//Virtual for text as array

DataSchema
.virtual('text_array')
.get(function(){
     const array = this.text.split(' ');
});


//Export module
module.exports = mongoose.model('Data', DataSchema);

