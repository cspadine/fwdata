//This takes the string entered in the text field, splits it into an array,
//and calls autoPopulateGloss function to fill the morphSpace div.
function populateGloss(){
  let text = document.getElementById('text').value;
  let textArray = text.trim().split(' ');
  const morphSpace = document.getElementById('morph_space');
  const content = autoPopulateGloss(textArray);
morphSpace.innerHTML = content;
}


//This takes the array from populateGloss, calls makeRequest to retreieve the gloss
//suggestions, and then returns a value to put in the morphSpace div.
function autoPopulateGloss(array){
  let textArray = [];
  for (let i = 0 ; i < array.length  ; i++){
    textArray.push(array[i].replace(/[\!\?\.\;\,\:]$|[\(\)\"]/g,''));
  }
  let morphSpaceContent = '<table><tr>';
  let glossSpaceContent = '</tr><tr>'
  let glossSuggestionContent = '</tr><tr>'
  for (let i = 0; i < textArray.length;i++){
    const splitTextArray = textArray[i].split(/[-~=\/]/);
      if (splitTextArray.length > 1){
      morphSpaceContent += `<td><span class="input" id='morph_span_${i}' role="textbox" oninput='morphChangeInput(${i})' contenteditable> ${textArray[i]}</span></td>`;
      glossSpaceContent += `<td id='gloss_span_${i}_td'><table><tr>`
      glossSuggestionContent+= `<td id='gloss_suggestion_${i}_td'><table><tr>`
      let sepArray = [...textArray[i].matchAll(/[-~=\/]/g)];
      document.getElementById('demo').innerHTML = sepArray;
      for (let l = 0 ; l < (splitTextArray.length-1); l++) {
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
    morphSpaceContent += `<td><span class="input" id='morph_span_${i}' role="textbox" oninput='morphChangeInput(${i})' contenteditable> ${textArray[i]}</span></td>`;
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






//when the morph cell is changed, the gloss suggestions are updated to
function morphChangeInput(x){
  let input = document.getElementById(`morph_span_${x}`).innerHTML
  const splitTextArray = input.split(/[-~=\/]/);
  if (splitTextArray.length > 1 ){
    let sepArray = [...input.matchAll(/[-~=\/]/g)];
    let glossSpaceContent = '<table><tr>';
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
  const glossSpaceContent = `<table><tr><td> <span class="input" id='gloss_span_${x}' role="textbox" contenteditable>gloss</span></td></tr></table>`;
  document.getElementById(`gloss_span_${x}_td`).innerHTML = glossSpaceContent;
  const glossSuggestionContent = `<table><tr><td colspan=2 > <div id='glossSuggestion${x}'>suggestion<div></td></tr></table>`;
  document.getElementById(`gloss_suggestion_${x}_td`).innerHTML = glossSuggestionContent;
  makeRequest(input.trim())
  .then(res => formatGlossResults(res,x))
  .then(resList => {document.getElementById(`glossSuggestion${x}`).innerHTML = resList});
}}



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





//upon submitting the new data, this prevents the default submission, reformats the
//data, and then submits the reformatted version.
document.getElementById("newDataForm").addEventListener("submit", function(event){
  event.preventDefault()
  const textLength = document.getElementById('text').value.split(' ').length;
    let glossValue = '';
    let morphValue = '';
  for (let i = 0; i < textLength; i++){
    if (document.getElementById(`gloss_span_${i}_td`).innerHTML.includes('<table')){
      const morphItem = document.getElementById(`morph_span_${i}`).innerHTML;
      const morphItemSubArray = morphItem.split(/[-~=\/]/);
      const sepArray = [...morphItem.matchAll(/[-~=\/]/g)];
      for (let j = 0 ; j < morphItemSubArray.length-1 ; j++){
        glossValue += document.getElementById(`gloss_span_${i}_${j}`).innerHTML
          glossValue += sepArray[j];
      }
      glossValue += document.getElementById(`gloss_span_${i}_${morphItemSubArray.length-1}`).innerHTML + ',';
    }else{
      glossValue += document.getElementById(`gloss_span_${i}`).innerHTML+',';
    }
    morphValue += document.getElementById(`morph_span_${i}`).innerHTML+',';
  }
  document.getElementById('morph').setAttribute('value',morphValue);
  document.getElementById('gloss').setAttribute('value',glossValue);
  document.getElementById("newDataForm").submit()
});


//requests gloss suggestions from the server
const makeRequest = function (url, method){
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
    request.open(method || 'GET', '../secure/lexicon/'+url, true);
    request.send();
  })
}
