//processes the request body into a well-formed MongoDB query
module.exports.getQueryList = function (req){
//"searchList" will contain all the search parameters,
//which will always include the user id so that
//the only results will be those that belong to the
//specific user.
  let searchList = [{'user':req.user.user._id}];
//paramsList contains the possible parameters that users
//can search for
  let paramsList = ['text','gloss','trans','notes','source','ref','tags','judgment','lang'];
//loops throough each search parameter
  for (let j = 0; j < paramsList.length;j++){
    const currentParam = paramsList[j];
//queryTermList is the list of search terms for the particular parameter
    const queryTermList = req.body[currentParam].split(' ');
//loop though each search term for the current parameter, if
//there is a non-empty value.
    const textSearchObject = {};
    for (let i = 0; i< queryTermList.length; i++){
      if (queryTermList[i] != ''){

        const textSearchObject = {};
//escape special regex characters
        const queryTerm = queryTermList[i].replace(/\*/g, "\\*")
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
//add separators to the edges of the search term (to avoid word-internal matches)
        const regexSep = '(?:^|\\W)'+queryTerm+'(?:$|\\W)'
//add 'i' to regex expression, to make it case-insensitive
        const text_regex = new RegExp(regexSep,'i')
//create an object that will be used to search for text_regex in the database under
//the current parameter
        textSearchObject[currentParam] = {$regex: text_regex};
//add this object to the list of search parameters.
        searchList.push(textSearchObject);
      }
    }
  }
  console.log(searchList)
  return searchList;
}
