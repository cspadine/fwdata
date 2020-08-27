const Lex = require('../models/lexiconSecure');
const mongoose = require('mongoose');


//wordsToMorphs takes an array of words with morpheme boundaries indicated
//by punctuation (= morph) and an array of gloss items with morpheme boundaries indicated
//by punctuation corresponding to the relevant word (=gloss)
module.exports.wordsToMorphs = function (morph,gloss){
  //there should be one gloss item for each word; if not, then no information should
  //be stored in the lexicon based on this data, as it is not clear which
  //glosses correspond to which morphemes
    if (morph.length != gloss.length)
    //throw error if there are not the same number of words as gloss items.
    {throw 'The words and glosses do not align; no lexical items saved.'}
    //if number of words is the same as number of gloss, items, proceed
    else {
      //create empty arrays that will contain a list of morphemes and glosses
      let morphEndArray = [];
      let glossEndArray = [];
      //loop throught words in morph and gloss
      for (let i = 0 ; i < morph.length; i++){
        //split words on punctuation indicating morpheme boundaries
        const morphSubArray = morph[i].split(/[-~+()\/\[\]$]/);
        const glossSubArray = gloss[i].split(/[-~+()\/\[\]$]/);
        //check if there are the same number of morphemes as glosses in each word.
          if (morphSubArray.length != glossSubArray.length){
          // if there are not the same number of morphemes as glosses, throw an
          // error
          throw `"${morph[i]}" doesn't have the same number of items as its gloss.`;
            } else {
              //if there are the same number of morphemes, loop through and add
              //each morpheme-gloss pair to the corresponding list
                  for (let j = 0 ; j < morphSubArray.length ; j++){
                    morphEndArray.push(morphSubArray[j])
                    glossEndArray.push(glossSubArray[j])
                  };
            };
    }
    const morphAndGloss = [morphEndArray, glossEndArray];
    return morphAndGloss
  }
}






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



//loops through the list of morphemes and for each morpheme, checks whether it
//is already in the lexicon, and then saves it if it is not. Returns a list of the
//ids of every morpheme in the sentence.
module.exports.CFEloop = function(morphArray, glossArray, user, lang) {
  //promises will be an array of promize objects
  let promises = [];
  //the function itself also returns a promise
  return new Promise ((resolve, reject) => {
      //morpheme_ids will be the list of morphemes ids
      let morpheme_ids = [] //will contain the ids of the morphemes
      //loop through the list of morphemes, and for each morpheme add as promise
      //for the result of checkForExisting
      for (let i = 0; i < morphArray.length; i++){
        promises.push(checkForExisting(morphArray[i],glossArray[i], user, lang)
             .then(output => {

       //check for existing always returns an object; if the lexeme already exists,
       //it will return an object that only contains the id of the existing lexeme.
       //if the lexeme does not exist, it will return an object that contains
       //all of the information that will then be saved as a new lexeme.
               if (Object.keys(output).includes("morph")){ //if output has 'morph'
               //key, then the lexeme is not yet in the database.
                 const lexeme = new Lex(output); //creates new Lex object
                 console.log(lexeme)
                 lexeme.save(); //saves Lex object
                 morpheme_ids.push(lexeme._id);//adds newly created id to
                 //list of morpheme ids
               } else { //if the lexeme already exists
                 console.log(output)
                 morpheme_ids.push(output._id)//adds existing lexeme id to list
          }

        }).catch((err)=>{
         reject();
      })
    )
    }
    //once all of the promises in promises have resolved, return morpheme_ids as the value.
        Promise.all(promises).then(()=>resolve(morpheme_ids)).catch((e)=> console.log(e))
  })
}








//checks whether an entry already exists for this combination of
//glosses and morphs
const checkForExisting = function (morph,gloss,user,lang){
  let lexeme = {
            morph : morph,
            gloss : gloss,
            user : user,
            lang: lang
          };
return new Promise ( (resolve, reject) => {
    Lex.findOne(lexeme)
     .then(data =>{
       if (data != null) {
        resolve(data._id)
      } else {
        resolve(lexeme)
      }
 })
 .catch(function (e) {
   console.log('Error occurred');
   console.log(e);
 })
})
}
