import PDFtoJPEG
import OCR
import findExInText
import segmentExamples
import shutil


docInfo = PDFtoJPEG.convertPDF('balinese.pdf')
OCR.OCR(docInfo)
findExInText.findEx(docInfo)
segmentExamples.segmentExamples(docInfo)
shutil.rmtree('PDFscrape/carrie')

print(docInfo)
