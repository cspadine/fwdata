const Lex = require('../models/lexiconSecure');
const mongoose = require('mongoose');
//takes an array of words and an array of glosses,
//makes sure that the lengths match, and converts it into an array
//where the individual morphemes are the items.
module.exports.wordsToMorphs = function (morph,gloss){
  if (morph.length == gloss.length){
    let morphEndArray = [];
    let glossEndArray = [];
    for (let i = 0 ; i < morph.length; i++){
      const morphSubArray = morph[i].split(/[-~+()\/\[\]$]/);
      const glossSubArray = gloss[i].split(/[-~+()\/\[\]$]/);
      if (morphSubArray.length == glossSubArray.length) {
        for (let j = 0 ; j < morphSubArray.length ; j++){
          morphEndArray.push(morphSubArray[j])
          glossEndArray.push(glossSubArray[j])
        };
      };
    };
  const morphAndGloss = [morphEndArray, glossEndArray];
  return morphAndGloss
  } else {
    console.log("lengths don't match!")
    return null
  }
};

//strip punctuation and leading/trailing spaces from morph row
module.exports.morphCleaner = function (array){
  let arrayCleaned = [];
  const regex = /\b[^. ]?[\w-+~.]+[^. ]?\b/g;
    for (let i = 0; i < array.length ; i++){
      const lowercase = array[i].toLowerCase();
      const cleanedText = lowercase.replace(/[.?*/()&!,"']+$/g,'').replace(/^[.?*&/()!,"']+/g,'').replace(/\s/g,'');
      arrayCleaned.push(cleanedText)
    }
  return arrayCleaned;
}












//checks whether an entry already exists for this combination of
//glosses and morphs
module.exports.checkForExisting = function (morph,gloss,user,lang){
  let lexeme = {
            morph : morph,
            gloss : gloss,
            user : user,
            lang: lang
          };
  return new Promise (function (resolve, reject){
    Lex.findOne(lexeme).then(data =>{
      if (data) {
        resolve(null)
      } else {
        resolve(lexeme)
      }
    }).catch((err)=>{
      reject();
    })
})
}
