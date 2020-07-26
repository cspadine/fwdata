



//This takes the value of the 'text' input field and splits it into
//separate morphemes on the 'morph' line.
function populateGloss(){
  let text = document.getElementById('text').value;
  let textArray = text.trim().split(' ');
  const morphSpace = document.getElementById('morph_space');
  const content = autoPopulateGloss(textArray);
morphSpace.innerHTML = content;
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


function autoPopulateGloss(array){
  let textArray = cleanTextArray(array);
  let morphSpaceContent = `<table><tr><td style="width: 70px;"><label for="morph" class='input_label'>Morphemes:<span class="tooltiptext">Tooltip text</span></label></td>`;
  let glossSpaceContent = `</tr><tr><td style="width: 70px;"><label for="gloss" class='input_label'>Gloss:<span class="tooltiptext">Tooltip text</span></label></td>`;
  let glossSuggestionContent = `</tr><tr><td style="width: 70px;"><label for="suggestions" class='input_label'>Other glosses:<span class="tooltiptext">Tooltip text</span></label></td>`
  for (let i = 0; i < textArray.length;i++){
    let splitTextArray = textArray[i].split(/[-~=\/<>]/);
    splitTextArray = splitTextArray.filter(word => word.length > 0);
      if (splitTextArray.length > 1){
      let sepArray = [...textArray[i].matchAll(/[-~=\/<>]/g)];
      const textArrayEsc = textArray[i].replace('<','&lt;').replace('>','&gt;')
      morphSpaceContent += `<td><span class="input" id='morph_span_${i}' role="textbox" oninput='morphChangeInput(${i})' contenteditable> ${textArrayEsc}</span></td>`;
      glossSpaceContent += `<td id='gloss_span_${i}_td'><table><tr>`
      glossSuggestionContent+= `<td id='gloss_suggestion_${i}_td'><table><tr>`
      for (let l = 0 ; l < (splitTextArray.length-1); l++) {
        if (sepArray[l] == '<'){
          glossSpaceContent += `<td>${sepArray[l]}</td>`;
          sepArray.splice(l,1)
        }
          glossSpaceContent += `<td> <span class="input" id='gloss_span_${i}_${l}' role="textbox" contenteditable></span></td><td>${sepArray[l]}</td>`;
          glossSuggestionContent += `<td colspan=2 > <div id='gloss_suggestion_${i}_${l}'><div></td>`;
      }
      glossSpaceContent += `<td><span class="input" id='gloss_span_${i}_${splitTextArray.length-1}' role="textbox" contenteditable></span></td>`
      glossSpaceContent += `</tr></table></td>`
      glossSuggestionContent += `<td><div id='gloss_suggestion_${i}_${splitTextArray.length-1}'></div></td>`
      glossSuggestionContent += `</tr></table></td>`
        for (let j = 0 ; j < splitTextArray.length ; j++){
          if(splitTextArray[j].trim()){
            makeRequest(splitTextArray[j])
            .then(res => formatGlossComplex(res,i,j))
            .then(resList => {document.getElementById(`gloss_suggestion_${i}_${j}`).innerHTML = `${resList}`} )
          }
        }
      }

      else {
    morphSpaceContent += `<td><span class="input" id='morph_span_${i}' role="textbox" oninput='morphChangeInput(${i})' contenteditable> ${textArray[i]} </span></td>`;
    glossSpaceContent += `<td id='gloss_span_${i}_td' ><span class="input" id='gloss_span_${i}' role="textbox" contenteditable></span></td>`;
    makeRequest(textArray[i])
    .then(res => formatGlossResults(res,i))
    .then(resList => {document.getElementById(`glossSuggestion${i}`).innerHTML = resList});
    glossSuggestionContent += `<td id='gloss_suggestion_${i}_td' ><p id='glossSuggestion${i}'></p></td>`
    }
  }
  morphSpaceContent += glossSpaceContent;
  morphSpaceContent += glossSuggestionContent;
  morphSpaceContent += '</tr></table>';
  return morphSpaceContent
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
    resList += `<input type='button' id='gloss_suggestion_${x}_${j}_${k}' value='${JSON.parse(gloss).lexRes[j].gloss}' onclick="addComplexGloss('${x}','${j}','${k}')"><br>`
      if (j === 0 ){
        document.getElementById(`gloss_span_${x}_${k}`).innerHTML = JSON.parse(gloss).lexRes[j].gloss;
      }
    }
    return resList;
}
//on clicking a suggested gloss, the corresponding gloss cell autopopulates with the
//selected value
function addGloss(x,j){
  const selectedGlossSuggestion = document.getElementById(`gloss_suggestion_${x}_${j}`).value;
  document.getElementById(`gloss_span_${x}`).innerHTML = selectedGlossSuggestion;
}


function addComplexGloss(x,j,k){
    const selectedGlossSuggestion = document.getElementById(`gloss_suggestion_${x}_${j}_${k}`).value;
  document.getElementById(`gloss_span_${x}_${k}`).innerHTML = selectedGlossSuggestion;
}


//changes the gloss suggestion results from the server to an HTML readable format
function formatGlossResults (gloss,x) {
  let resList = '';
    for (let j = 0; j < JSON.parse(gloss).lexRes.length; j++) {
    resList += `<input type='button' id='gloss_suggestion_${x}_${j}' value='${JSON.parse(gloss).lexRes[j].gloss}' onclick="addGloss('${x}','${j}')"><br>`;
    if (j === 0 ){
        document.getElementById(`gloss_span_${x}`).innerHTML = JSON.parse(gloss).lexRes[j].gloss;
    }
  }
  return resList
}






//when the morph cell is changed, the gloss suggestions are updated to
function morphChangeInput(x){
  let input = document.getElementById(`morph_span_${x}`).innerHTML
  const splitTextArray = input.split(/[-~=\/]/g);
  if (splitTextArray.length > 1 ){
    let sepArray = [...input.matchAll(/[-~=\/]/g)];
    let glossSpaceContent = `<table><tr>`;
    let glossSuggestionContent = '<table><tr>'
    for (let m = 0 ; m < splitTextArray.length-1; m++){
      glossSpaceContent += `<td> <span class="input" id='gloss_span_${x}_${m}' role="textbox" contenteditable></span></td><td>${sepArray[m]}</td>`;
      glossSuggestionContent += `<td colspan=2 > <div id='gloss_suggestion_${x}_${m}'><div></td>`;
    }
    glossSpaceContent += `<td><span class="input" id='gloss_span_${x}_${splitTextArray.length-1}' role="textbox" contenteditable></span></td>`
    glossSpaceContent += `</tr></table></td>`
    glossSuggestionContent += `<td><div id='gloss_suggestion_${x}_${splitTextArray.length-1}'></div>`
    glossSuggestionContent += `</tr></table>`
    document.getElementById(`gloss_span_${x}_td`).innerHTML = glossSpaceContent;
    document.getElementById(`gloss_suggestion_${x}_td`).innerHTML = glossSuggestionContent;

    for (let j = 0 ; j < splitTextArray.length ; j++){
      if(splitTextArray[j].trim()){
        makeRequest(splitTextArray[j].trim())
        .then(res => formatGlossComplex(res,x,j))
        .then(resList => {document.getElementById(`gloss_suggestion_${x}_${j}`).innerHTML = resList} )
      } else {}
   }
  } else {
  const glossSpaceContent = `<table><tr><td> <span class="input" id='gloss_span_${x}' role="textbox" contenteditable></span></td></tr></table>`;
  document.getElementById(`gloss_span_${x}_td`).innerHTML = glossSpaceContent;
  const glossSuggestionContent = `<table><tr><td colspan=2 > <div id='glossSuggestion${x}'><div></td></tr></table>`;
  document.getElementById(`gloss_suggestion_${x}_td`).innerHTML = glossSuggestionContent;
  makeRequest(input.trim())
  .then(res => formatGlossResults(res,x))
  .then(resList => {document.getElementById(`glossSuggestion${x}`).innerHTML = resList});
}}






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
