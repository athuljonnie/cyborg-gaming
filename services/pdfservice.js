const PDFdocument = require('pdfkit');
const fs = require('fs');

function buildPDF(dataCallback, endCallback) {
const doc = new PDFdocument();
doc.on('data', dataCallback);
doc.on('end', endCallback);
doc.text('Some text with an embedded font!', 100, 100);
  doc.end();
}

module.exports ={buildPDF}