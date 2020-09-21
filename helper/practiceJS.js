const csv = require('csv-parser');
const fs = require('fs');
const iso = [];
const langs = [];
const codes = {};

fs.createReadStream('./PDFscripts/Language.csv')
  .pipe(csv())
  .on('data', (row) => {
    const lang = row[`SK_Language"|"ISO639-3Code"|"ISO639-2BCode"|"ISO639-2TCode"|"ISO639-1Code"|"LanguageName"|"Scope"|"Type"|"MacroLanguageISO639-3Code"|"MacroLanguageName"|"IsChild`];
    let no = lang.replace(/\d\d\d\d\d\|"/g,'')
    no = no.replace(/"\|"(\w\w\w")?\|"(\w\w\w")?\|"(\w\w\w")?\|"/g,'#')
    no = no.replace(/"\|".*"/g,'')
    no = no.replace(/\|[01]/g,'')
    pair = no.split('#')
    iso.push(pair[0]);
    langs.push(pair[1]);


  })
  .on('end', () => {
    console.log(iso.length)
    for (let i = 0; i < iso.length; i++){
      codes[iso[i]] = langs[i]
    }
    console.log(codes)
    fs.writeFile('iso_codes.txt',JSON.stringify(codes), (err) => {console.log(err)})
  });
