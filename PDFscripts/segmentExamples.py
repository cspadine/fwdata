import os
import re
import json
import pprint
pp = pprint.PrettyPrinter(indent=4)

def segmentExamples(docInfo):
    path = docInfo[0]["filepath"]
    file = open(path+'/balineseExampleTexts.txt')
    text = file.read().split('@@@@')

    multiRegEx = '\n?\n\(\d{1,3}\) [a-z]\.'
    singletonExamples = []
    multipartExamples = []


    for line in text:
        multiRegExVal = re.search(multiRegEx, line)
        if multiRegExVal == None:
            singletonExamples.append(line)
        else:
            multipartExamples.append(line)

#for example in singletonExamples:
#    print(example)

    refRE = '\((\d{1,3})\)'
    textRE = '\(\d{1,3}\) ?\s?(.*)\n'
    glossRE = '\(\d{1,3}\) ?\s?.*\n(.+)\n'
    transRE = '\(\d{1,3}\) ?\s?.*\n.+\n(.+)\n\n'
    judgmentRE = '[#\?%\*]+'

    sentences = [];
    for example in singletonExamples:
        sentence = {}
        ref = re.findall(refRE, example)
        text = re.findall(textRE, example)
        gloss = re.findall(glossRE, example)
        trans = re.findall(transRE, example)
        judgment = re.findall(judgmentRE, example)
        sentence.update({"ref":str(ref)[2:-2]})
        sentence.update({"text":str(text)[2:-2]})
        sentence.update({"gloss":str(gloss)[2:-2]})
        sentence.update({"trans":str(trans)[2:-2]})
        sentence.update({"judgment":str(judgment)[2:-2]})
        sentences.append(sentence)

    multipartRefNoRE = '\((\d{1,3})\) ?\s?'
    multipartRefLetterRE = '\s([a-z])\.?\s'
    multipartExampleSplitRE = '[a-z]\. ((?:.+[ \n\s])+)'
    multipartTextRE = '^(?:[#\?%\*]+)?(.+)\n'
    multipartGlossRE = '\n(.+)\n'
    multipartTransRE = '\n.+\n(.+)$'
    multipartJudgmentRE = '^[#\?%\*]+'

    for example in multipartExamples:
        #print(example)
        refNo = re.findall(multipartRefNoRE, example)[0]
        refLetter = re.findall(multipartRefLetterRE, example)
        refLetter = sorted(set(refLetter))
        examplesSplit = re.findall(multipartExampleSplitRE, example)
        #print(examplesSplit)
        for i, letter in enumerate(refLetter):
            sentence = {};
            ref = refNo+refLetter[i]
            text = re.findall(multipartTextRE, examplesSplit[i])
            gloss = re.findall(multipartGlossRE, examplesSplit[i])
            trans = re.findall(multipartTransRE, examplesSplit[i])
            judgment = re.findall(multipartJudgmentRE, examplesSplit[i])
            sentence.update({"ref":str(ref)[2:-2]})
            sentence.update({"text":str(text)[2:-2]})
            sentence.update({"gloss":str(gloss)[2:-2].split(' ')})
            sentence.update({"trans":str(trans)[2:-2]})
            sentence.update({"judgment":str(judgment)[2:-2]})
            sentence.update({"morph":re.sub('[\",\.\?\'!_]*','',str(text)[2:-2]).split(' ')})
            sentences.append(sentence)

        pp.pprint(sentences)
