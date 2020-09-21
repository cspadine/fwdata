const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SourceSchema = new Schema(
  {
    user : {type: String, required: true},
    author: {type: Array, required: true},
    year: {type: String},
    bookTitle: {type: String},
    journalTitle: {type: String},
    articleTitle: {type: String},
    chapterTitle: {type: String},
    publisher: {type: String},
});

//Virtual for text as array


//Export module
module.exports = mongoose.model('source', SourceSchema);
