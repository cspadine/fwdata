import cv2
import pytesseract
import os
from pathlib import Path

def OCR(docInfo):
    path = docInfo[0]["filepath"]

    folder = os.fsencode(path)

    filenames = []
    filenames_sorted = []
    text = ''

    for file in os.listdir(folder):
        filename = os.fsdecode(file)
        if filename.endswith( ('.jpg') ):
            filenames.append(filename)

    for i, __ in enumerate(filenames):
        for file in filenames:
            index = file.find('_')
            file_no = file[index+1:-4]
            if int(file_no) == i:
                filenames_sorted.append(file)


    for file in filenames_sorted:
        img = cv2.imread(path + '/'+str(file))
        text = text + pytesseract.image_to_string(img)




    with open(path + '/text.txt', 'w') as f:
        f.write(text)
        f.close()

    print(text)
