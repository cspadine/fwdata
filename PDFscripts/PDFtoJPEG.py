import os
import tempfile
from pdf2image import convert_from_path
from pdfminer.pdfparser import PDFParser
from pdfminer.pdfdocument import PDFDocument
os.mkdir('../PDFscrape/carrie')

def convertPDF(filename):
    cmd = f'pdfinfo {filename} | grep "Pages" |'+' awk "{print $2}"'
    print(os.popen(cmd).read().strip())


    fp = open(filename, 'rb')
    parser = PDFParser(fp)
    doc = PDFDocument(parser)

    print(doc.info)





    with tempfile.TemporaryDirectory() as path:
     images_from_path = convert_from_path(filename, output_folder=path, )

#base_filename  =  os.path.splitext(os.path.basename(filename))[0] + '.jpg'



#for page in images_from_path:
#    page.save(os.path.join(save_dir, base_filename), 'JPEG')

    for idx,page in enumerate(images_from_path):
        page.save('../PDFscrape/carrie/page_'+str(idx)+'.jpg', 'JPEG')

    docInfo = doc.info
    docInfo[0].update({"filepath" : "../PDFscrape/carrie"})
    return(docInfo)
