import os
import re
def findEx(docInfo):
    path = docInfo[0]["filepath"]
    file = open(path + '/text.txt')
    text = file.read()

#examples = []


#

    multipartEx = '(?:\n\(\d{1,3}\) ?(?:[a-z].*\n(?:.+\n)+\n?.*[’\'\"]\n?\n?)+)'


#singletonEx = '(\n\(\d{1,3}\) [^a].*\n.+\n\n?.*[’\'\"])'
    singletonEx = '\n\n\(\d{1,3}\) [^a].*(?:\n.+)+\n\n?(?:.+)\n\n'
    allSingletonEx = re.findall(singletonEx,text)
    allMultipartEx = re.findall(multipartEx,text)

    for ex in allSingletonEx:
        print(ex)

    for ex in allMultipartEx:
        print(ex)

    allEx = allSingletonEx + allMultipartEx

    newFile = open(path+'/balineseExampleTexts.txt', 'w')
    for ex in allEx:
        newFile.write(ex+'@@@@')

    newFile.close()
