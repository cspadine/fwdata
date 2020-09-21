



//This takes the value of the 'text' input field and splits it into
//separate morphemes on the 'morph' line.
function populateGloss(){
  let text = document.getElementById('text').value;
  let textArray = text.trim().split(' ');
  const morphSpace = document.getElementById('morph_space');
  const content = autoPopulateGloss(textArray);
//  morphSpace.innerHTML = content;
morphSpace.appendChild(content);
}






function autoPopulateGloss(array){

  //this function is going to run every time something changes in the text input
  //and we want the newest version of the content to overwrite the previous versions
  //so we need to clear out the previous content in this space before we add
  //anything new
  document.getElementById('morph_space').innerHTML = '';

  //strips punctuation from the array of words
  let textArray = cleanTextArray(array);

  //create a table to hold the morpheme-by-morpheme gloss
  const glossTable = document.createElement('table');


  //create a row to hold the morpheme breakdown
  const morphRow = document.createElement('tr');
  morphRow.setAttribute('id','morphRow');

  //create and append a label for the morpheme breakdown
  const morphLabel = document.createElement('td');
  morphLabel.setAttribute('id','morphLabel');
  morphLabel.setAttribute('class','input_label');
  morphLabel.innerHTML = 'Morphemes:'
  morphRow.appendChild(morphLabel)

  //create and append mouseover text for the morpheme label
  const morphLabelTip = document.createElement('span');
  morphLabelTip.setAttribute('class','tooltiptext');
  morphLabelTip.innerHTML = 'Mouseover Text';
  morphLabel.appendChild(morphLabelTip)

  //create a row to hold the gloss
  const glossRow = document.createElement('tr');
  glossRow.setAttribute('id','glossRow');

  //create and append a label for the gloss
  const glossLabel = document.createElement('td');
  glossLabel.setAttribute('id','glossLabel');
  glossLabel.setAttribute('class','input_label');
  glossLabel.innerHTML = 'Gloss:'
  glossRow.appendChild(glossLabel)

  //create and append mouseover text for the gloss
  const glossLabelTip = document.createElement('span');
  glossLabelTip.setAttribute('class','tooltiptext');
  glossLabelTip.innerHTML = 'Mouseover Text';
  glossLabel.appendChild(glossLabelTip)

  //create a row for alternate gloss suggestions
  const suggestionRow = document.createElement('tr');
  suggestionRow.setAttribute('id','suggestionRow');

  //create and append a label for the suggestions
  const suggestionLabel = document.createElement('td');
  suggestionLabel.setAttribute('id','suggestionLabel');
  suggestionLabel.setAttribute('class','input_label');
  suggestionLabel.innerHTML = 'Suggestions:'
  suggestionRow.appendChild(suggestionLabel)

  //create and append mouseover text for the suggestion label
  const suggestionLabelTip = document.createElement('span');
  suggestionLabelTip.setAttribute('class','tooltiptext');
  suggestionLabelTip.innerHTML = 'Mouseover Text';
  suggestionLabel.appendChild(suggestionLabelTip)

  //append morph, gloss, and suggestion rows to table.
  //these are currently empty, will be populated below.
  glossTable.appendChild(morphRow)
  glossTable.appendChild(glossRow)
  glossTable.appendChild(suggestionRow)

  //loop through each item in the array we've created from the text input
  for (let i = 0; i < textArray.length; i++){
    //for each word in the array, create a sub-array by splitting the word on
    //punctuation that indicates a morpheme boundary.
    let splitTextArray = textArray[i].split(/[-~=\/<>]/);
    //remove empty elements from the array of morphemes.
    splitTextArray = splitTextArray.filter(word => word.length > 0);
    //check if there is more than one morpheme in this word
    if (splitTextArray.length > 1){
      //if the word is morphologically complex, get an list of the separators
      //within the word
      let sepArray = [...textArray[i].matchAll(/[-~=\/<>]/g)];

      //for each word, create a cell that contains the morphemes that make up
      //the word
      const morphCell = document.createElement('td');
      const morphCellSpan = document.createElement('span');
      morphCellSpan.setAttribute('class','input');
      morphCellSpan.setAttribute('id',`morph_span_${i}`);
      morphCellSpan.setAttribute('role','textbox');
      morphCellSpan.addEventListener('input', function(e){morphChangeInput(i)});
      morphCellSpan.contentEditable = true;
      morphCellSpan.innerHTML = textArray[i].replace('<','&lt;');
      morphCell.appendChild(morphCellSpan);
      morphRow.appendChild(morphCell);

      //to get the gloss and the morph to line up, we have to put the glosses for
      //each morpheme in a word inside a single cell, so we'll create a cell here
      //and fill it with more cells for each morpheme.

      const glossCell = document.createElement('td');
      glossCell.setAttribute('id',`gloss_span_${i}_td`);
      const glossSubTable = document.createElement('table');
      glossSubTable.setAttribute('id',`gloss_sub_table_${i}`);
      const glossSubTableRow = document.createElement('tr');
      glossSubTableRow.setAttribute('id',`gloss_sub_table_${i}_row`)

      glossRow.appendChild(glossCell);
      glossCell.appendChild(glossSubTable);
      glossSubTable.appendChild(glossSubTableRow);

      //Same thing for the suggestiions: the need to be inside a table
      //in order to line up.
      const suggestionCell = document.createElement('td');
      suggestionCell.setAttribute('id',`suggestion_span_${i}_td`);
      const suggestionSubTable = document.createElement('table');
      suggestionSubTable.setAttribute('id',`suggestion_sub_table_${i}`);
      const suggestionSubTableRow = document.createElement('tr');
      suggestionSubTableRow.setAttribute('id',`suggestion_sub_table_${i}_row`)

      suggestionRow.appendChild(suggestionCell);
      suggestionCell.appendChild(suggestionSubTable);
      suggestionSubTable.appendChild(suggestionSubTableRow);



      //loop through the individual morphemes in the word. This loop will insert the
      //morphemes, but also the seperators, so we only want to go up to the second
      //last morpheme in this loop, because there is no separator to add to the
      //final element
      for (let l = 0 ; l < (splitTextArray.length-1); l++) {
        //if character at index l is an open bracket, it should go
        //before the corresponding morpheme, so if we run into one of those, we
        //insert it first and then remove it from the list (so that later when we
        //call the element at index l, it will be the correct separator)
        if (sepArray[l] == '<'){
          const glossSubCellSepOpen = document.createElement('td');
          glossSubCellSepOpen.innerHTML = '<';
          glossSubTableRow.appendChild(glossSubCellSepOpen);
          sepArray.splice(l,1)
        }

        //create and append a cell in the gloss sub-table that will contain the
        //corresponding gloss
        const glossSubCell = document.createElement('td');
        const glossSubCellSpan = document.createElement('span');
        glossSubCellSpan.setAttribute('class','input');
        glossSubCellSpan.setAttribute('id',`gloss_span_${i}_${l}`);
        glossSubCellSpan.setAttribute('role','textbox');
        glossSubCellSpan.contentEditable = true;
        glossSubCell.appendChild(glossSubCellSpan);
        glossSubTableRow.appendChild(glossSubCell);

        //insert the separator between morphemes
        const glossSubCellSep = document.createElement('td');
        glossSubCellSep.innerHTML = sepArray[l];
        glossSubTableRow.appendChild(glossSubCellSep);

        //create and append a cell for the gloss suggestions that will contain the
        //corresponding suggestions
        const suggestionSubCell = document.createElement('td');
        suggestionSubCell.setAttribute('id',`suggestion_span_${i}_${l}_td`);
        suggestionSubTableRow.appendChild(suggestionSubCell);

      }
      //now we add the final morpheme, not followed by a separator
      const glossSubCell = document.createElement('td');
      const glossSubCellSpan = document.createElement('span');
      glossSubCellSpan.setAttribute('class','input');
      glossSubCellSpan.setAttribute('id',`gloss_span_${i}_${splitTextArray.length-1}`);
      glossSubCellSpan.setAttribute('role','textbox');
      glossSubCellSpan.contentEditable = true;
      glossSubCell.appendChild(glossSubCellSpan);
      glossSubTableRow.appendChild(glossSubCell);

      //add a final spot for gloss suggestions
      const suggestionSubCell = document.createElement('td');
      suggestionSubCell.setAttribute('id',`suggestion_span_${i}_${splitTextArray.length-1}_td`);
      suggestionSubTableRow.appendChild(suggestionSubCell);


      for (let j = 0 ; j < splitTextArray.length ; j++){
          if(splitTextArray[j].trim()){
            makeRequest(splitTextArray[j])
            .then(res => formatGlossComplex(res,i,j))
            .then(resList => {document.getElementById(`suggestion_span_${i}_${j}_td`).innerHTML = `${resList}`} )
          }
        }
      }      else {
        //add cell for morphemes and their contents
        const morphCell = document.createElement('td');
        const morphCellSpan = document.createElement('span');
        morphCellSpan.setAttribute('class','input');
        morphCellSpan.setAttribute('id',`morph_span_${i}`);
        morphCellSpan.setAttribute('role','textbox');
        morphCellSpan.addEventListener('input', function(e){morphChangeInput(i)});
        morphCellSpan.contentEditable = true;
        morphCellSpan.innerHTML = textArray[i];
        morphCell.appendChild(morphCellSpan);
        morphRow.appendChild(morphCell);

        //add cell for gloss
        const glossCell = document.createElement('td');
        glossCell.setAttribute('id',`gloss_span_${i}_td`);
        const glossCellSpan = document.createElement('span');
        glossCellSpan.setAttribute('class','input');
        glossCellSpan.setAttribute('id',`gloss_span_${i}`);
        glossCellSpan.setAttribute('role','textbox');
        glossCellSpan.contentEditable = true;
        glossCell.appendChild(glossCellSpan);
        glossRow.appendChild(glossCell);

        //add a spot for gloss suggestions
        const suggestionSubCell = document.createElement('td');
        suggestionSubCell.setAttribute('id',`suggestion_span_${i}_td`);
        suggestionRow.appendChild(suggestionSubCell);

        //get gloss entries for the morpheme
        makeRequest(textArray[i])
          .then(res => formatGlossResults(res,i))
          .then(resList => {document.getElementById(`suggestion_span_${i}_td`).innerHTML = resList});
    }
  }
  return glossTable;
}













//removes punctuation that does not typically indicate morpheme boundaries from words
const cleanTextArray = function(array){
  let textArray = [];
  for (let i = 0 ; i < array.length  ; i++){
    if (array[i].includes('<') && array[i].includes('>')){
      const pattern = /<.*>/;
      const matches = array[i].match(pattern);
      const match = array[i].match(pattern);
      const word = array[i].replace(match[0],'');
      const infixedWord = match[0]+ word
      textArray.push(infixedWord.replace(/\[|!|\]|\?|\.$|,|;|:|\*|{.*}|\(|\)/g,''))
    } else {
    textArray.push(array[i].replace(/\[|!|\]|\?|\.$|,|;|:|\*|{.*}|\(|\)/g,''));
    }
  }
  console.log(textArray)
  return textArray;
}




//requests gloss suggestions from the server
const makeRequest = function (url, method){
  const lang = document.getElementById('lang').value;
  const request = new XMLHttpRequest();
  return new Promise(function (resolve, reject) {
    request.onreadystatechange = function () {
      if (request.readyState !== 4) return;
      if (request.status >= 200 && request.status < 300){
        resolve(request.response);
      } else {

        reject({
          status: request.status,
          statusText: request.statusText
        });
      }
    }
    request.open(method || 'GET', '/secure/lexicon/'+url+'/'+lang, true);
    request.send();
  })
}


//handles formatting for morphologically complex word
function formatGlossComplex (gloss,x,k){
  let resList = '';
  for (let j = 0; j < JSON.parse(gloss).lexRes.length; j++) {
    resList += `<input type='button' id='suggestion_span_${x}_${j}_${k}' value='${JSON.parse(gloss).lexRes[j].gloss}' onclick="addComplexGloss('${x}','${j}','${k}')"><br>`
      if (j === 0 ){
        document.getElementById(`gloss_span_${x}_${k}`).innerHTML = JSON.parse(gloss).lexRes[j].gloss;
      }
    }
    return resList;
}



//on clicking a suggested gloss, the corresponding gloss cell autopopulates with the
//selected value
function addGloss(x,j){
  const selectedGlossSuggestion = document.getElementById(`suggestion_span_${x}_${j}`).value;
  document.getElementById(`gloss_span_${x}`).innerHTML = selectedGlossSuggestion;
}


function addComplexGloss(x,j,k){
    const selectedGlossSuggestion = document.getElementById(`suggestion_span_${x}_${j}_${k}`).value;
  document.getElementById(`gloss_span_${x}_${k}`).innerHTML = selectedGlossSuggestion;
}


//changes the gloss suggestion results from the server to an HTML readable format
function formatGlossResults (gloss,x) {
  let resList = '';
    for (let j = 0; j < JSON.parse(gloss).lexRes.length; j++) {
    resList += `<input type='button' id='suggestion_span_${x}_${j}' value='${JSON.parse(gloss).lexRes[j].gloss}' onclick="addGloss('${x}','${j}')"><br>`;
    if (j === 0 ){
        document.getElementById(`gloss_span_${x}`).innerHTML = JSON.parse(gloss).lexRes[j].gloss;
    }
  }
  return resList
}






//when the morph cell is changed, the gloss suggestions are updated
function morphChangeInput(x){
  document.getElementById('comments').innerHTML += 'input';
  //get input from whatever word is changed on the morpheme line
  let input = document.getElementById(`morph_span_${x}`).innerHTML;
  document.getElementById('comments').innerHTML += input;
  //split that word into morphemes on these seperators
  let splitTextArray = input.split(/[-~=\/>]|&lt;|&gt;/g);
  //remove empty elements from the array of morphemes.
  splitTextArray = splitTextArray.filter(word => word.length > 0);
  //remove the existing content of the corresponding gloss and suggestions
  document.getElementById(`gloss_span_${x}_td`).innerHTML = '';
//  document.getElementById(`suggestion_span_${x}`).innerHTML = '';
  document.getElementById(`suggestion_span_${x}_td`).innerHTML = '';

  //loop through morphemes in word
    if (splitTextArray.length > 1 ){
    //get morpheme separators
    let sepArray = [...input.matchAll(/[-~=\/<>]|&lt;|&gt;/g)];

    //get the corresponding HTML element that will hold the gloss
    const glossCell = document.getElementById(`gloss_span_${x}_td`);
    const glossSubTable = document.createElement('table');
    glossSubTable.setAttribute('id',`gloss_sub_table_${x}`);
    const glossSubTableRow = document.createElement('tr');
    glossSubTableRow.setAttribute('id',`gloss_sub_table_${x}_row`)

    //append the table and the row to the cell for the gloss
    glossCell.appendChild(glossSubTable);
    glossSubTable.appendChild(glossSubTableRow);




    //get the corresponding HTML element that will hold the suggestion
    const suggestionCell = document.getElementById(`suggestion_span_${x}_td`);
    const suggestionSubTable = document.createElement('table');
    suggestionSubTable.setAttribute('id',`suggestion_sub_table_${x}`);
    const suggestionSubTableRow = document.createElement('tr');
    suggestionSubTableRow.setAttribute('id',`suggestion_sub_table_${x}_row`)

    //append the table and the row to the cell for the gloss
    suggestionCell.appendChild(suggestionSubTable);
    suggestionSubTable.appendChild(suggestionSubTableRow);

    document.getElementById('comments').innerHTML += sepArray;

    for (let m = 0 ; m < splitTextArray.length-1; m++){

      //if character at index l is an open bracket, it should go
      //before the corresponding morpheme, so if we run into one of those, we
      //insert it first and then remove it from the list (so that later when we
      //call the element at index l, it will be the correct separator)
        if (sepArray[m] == '&lt;'){
        const glossSubCellSepOpen = document.createElement('td');
        glossSubCellSepOpen.innerHTML = '&lt;';
        glossSubTableRow.appendChild(glossSubCellSepOpen);
        sepArray.splice(m,1)
      }
      //create and append a cell in the gloss sub-table that will contain the
      //corresponding gloss
      const glossSubCell = document.createElement('td');
      const glossSubCellSpan = document.createElement('span');
      glossSubCellSpan.setAttribute('class','input');
      glossSubCellSpan.setAttribute('id',`gloss_span_${x}_${m}`);
      glossSubCellSpan.setAttribute('role','textbox');
      glossSubCellSpan.contentEditable = true;
      glossSubCell.appendChild(glossSubCellSpan);
      glossSubTableRow.appendChild(glossSubCell);

      //insert the separator between morphemes
      const glossSubCellSep = document.createElement('td');
      glossSubCellSep.innerHTML = sepArray[m];
      glossSubTableRow.appendChild(glossSubCellSep);

      //create and append a cell for the gloss suggestions that will contain the
      //corresponding suggestions
      const suggestionSubCell = document.createElement('td');
      suggestionSubCell.setAttribute('id',`suggestion_span_${x}_${m}_td`);
      suggestionSubTableRow.appendChild(suggestionSubCell);

    }

    //now we add the final morpheme, not followed by a separator
    const glossSubCell = document.createElement('td');
    const glossSubCellSpan = document.createElement('span');
    glossSubCellSpan.setAttribute('class','input');
    glossSubCellSpan.setAttribute('id',`gloss_span_${x}_${splitTextArray.length-1}`);
    glossSubCellSpan.setAttribute('role','textbox');
    glossSubCellSpan.contentEditable = true;
    glossSubCell.appendChild(glossSubCellSpan);
    glossSubTableRow.appendChild(glossSubCell);

    //add a final spot for gloss suggestions
    const suggestionSubCell = document.createElement('td');
    suggestionSubCell.setAttribute('id',`suggestion_span_${x}_${splitTextArray.length-1}_td`);
    document.getElementById(`suggestion_span_${x}_td`).appendChild(suggestionSubCell);

    for (let j = 0 ; j < splitTextArray.length ; j++){
      if(splitTextArray[j].trim()){
        makeRequest(splitTextArray[j].trim())
        .then(res => formatGlossComplex(res,x,j))
        .then(resList => {document.getElementById(`suggestion_span_${x}_${j}_td`).innerHTML = resList} )
      }
   }
  } else {
    //add cell for gloss
    const glossCell = document.getElementById(`gloss_span_${x}_td`);
    const glossCellSpan = document.createElement('span');
    glossCellSpan.setAttribute('id',`gloss_span_${x}`);
    glossCellSpan.setAttribute('class','input');
    glossCellSpan.setAttribute('role','textbox');
    glossCellSpan.contentEditable = true;
    glossCell.appendChild(glossCellSpan);

    //get gloss entries for the morpheme
    makeRequest(input.trim())
      .then(res => formatGlossResults(res,x))
      .then(resList => {document.getElementById(`suggestion_span_${x}_td`).innerHTML = resList});





//  const glossSpaceContent = `<table><tr><td> <span class="input" id='gloss_span_${x}' role="textbox" contenteditable></span></td></tr></table>`;
//  document.getElementById(`gloss_span_${x}_td`).innerHTML = glossSpaceContent;
//  const glossSuggestionContent = `<table><tr><td colspan=2 > <div id='glossSuggestion${x}'><div></td></tr></table>`;
//  document.getElementById(`gloss_suggestion_${x}_td`).innerHTML = glossSuggestionContent;
//  makeRequest(input.trim())
//  .then(res => formatGlossResults(res,x))
//  .then(resList => {document.getElementById(`glossSuggestion${x}`).innerHTML = resList});
//  }
  }
}

const suggestLang = function (){
    const dropdown = document.getElementById("myDropdown");
    dropdown.style.display = "block";
  const lang = document.getElementById('lang').value;
  const request = new XMLHttpRequest();
  return new Promise(function (resolve, reject) {
    request.onreadystatechange = function () {
      if (request.readyState !== 4) return;
      if (request.status >= 200 && request.status < 300){
        resolve(request.response);
      } else {

        reject({
          status: request.status,
          statusText: request.statusText
        });
      }
    }
    request.open('GET', '/secure/languages/'+lang, true);
    request.send();
  }).then((res)=>{
    res_obj = JSON.parse(res)
    const results = [];
    for (let i = 0; i < res_obj.length; i++){
      results.push([res_obj[i]['iso'],res_obj[i]['lang']])
    }
    dropdown.innerHTML = ''
      for (let j = 0 ; j < results.length ; j++){
        const language = document.createElement('a');
        language.innerHTML = JSON.stringify(results[j][1]).slice(1,-1)
        language.innerHTML += ' ('
        language.innerHTML += JSON.stringify(results[j][0]).slice(1,-1);
        language.innerHTML += ')'
        language.setAttribute('id',results[j][0]);
        language.setAttribute('onclick', 'setLang(this.id)');
        dropdown.appendChild(language)
        dropdown.innerHTML += '<br>';
      }


  })
}




const findLangs = function(){
  const h3 = document.createElement('h3')
  h3.innerHTML = "Recent languages:"
  document.getElementById('langAutoPopulate').appendChild(h3);
  const langList = language;
  const langs = []
  for (let i = 0; i < langList.length ; i++){
    if (langList[i] != ''){
        langs.push(langList[i])
    }
  }
  for (let i = 0; i < langs.length ;i++){
    const langButton = document.createElement('input');
    langButton.innerHTML = langs[i];
    langButton.setAttribute("value",langs[i]);
    langButton.setAttribute('type','button')
    langButton.setAttribute("id",langs[i]);
    langButton.setAttribute('onclick', 'setLang(this.value)');
    document.getElementById('langAutoPopulate').appendChild(langButton);
    if (i == 0){
      document.getElementById('lang').value = langs[i]
    }
  }
}

const setLang = function(lang){
  document.getElementById('lang').value = lang;
  populateGloss();
}





window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.style.display == 'block') {
        openDropdown.style.display = 'none';
      }
    }
  }
}
