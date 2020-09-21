//processes the request body into a well-formed MongoDB query
module.exports.getLexQueryList = function (req){
//"searchList" will contain all the search parameters,
//which will always include the user id so that
//the only results will be those that belong to the
//specific user.
  let searchList = [{'user':req.user.user._id}];
  console.log(searchList)
//paramsList contains the possible parameters that users
//can search for
  let paramsList = ['morph','gloss','lang'];
    console.log(paramsList)
//loops throough each search parameter
  for (let j = 0; j < paramsList.length;j++){
    const currentParam = paramsList[j];
      console.log(currentParam)
//queryTermList is the list of search terms for the particular parameter
    const queryTerm = req.body[currentParam];
    console.log(currentParam)
//loop though each search term for the current parameter, if
//there is a non-empty value.

      if (queryTerm != ''){

          console.log(queryTerm)
//escape special regex characters
        const queryTermClean = queryTerm.replace(/\*/g, "\\*")
        .replace(/\./g, "\\.")
        .replace(/\+/g, "\\+")
        .replace(/\?/g, "\\?")
        .replace(/\[/g, "\\]")
        .replace(/\^/g, "\\^")
        .replace(/\]/g, "\\]")
        .replace(/\$/g, "\\$")
        .replace(/\(/g, "\\)")
        .replace(/\)/g, "\\)")
        .replace(/\{/g, "\\}")
        .replace(/\=/g, "\\=")
        .replace(/\!/g, "\\!")
        .replace(/\</g, "\\<")
        .replace(/\>/g, "\\>")
        .replace(/\|/g, "\\|")
        .replace(/\:/g, "\\:")
        .replace(/\-/g, "\\-")
                  console.log(queryTermClean)
//add separators to the edges of the search term (to avoid word-internal matches)
        const regexSep = '(?:^|\\W)'+queryTermClean+'(?:$|\\W)'
                  console.log(regexSep)
//add 'i' to regex expression, to make it case-insensitive
        const text_regex = new RegExp(regexSep,'i')
        console.log(text_regex)
//create an object that will be used to search for text_regex in the database under
//the current parameter
        const textSearchObject ={}
        textSearchObject[currentParam] = {$regex: text_regex};
        console.log(textSearchObject)
//add this object to the list of search parameters.
        searchList.push(textSearchObject);
        console.log(searchList)
      }
  }
  return searchList;
  print(searchList)
}
