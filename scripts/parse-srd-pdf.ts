import fs from 'node:fs';
import path from 'node:path';
import pdfParse from 'pdf-parse';

const PDF_URL = 'https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf';
const OUTPUT_DIR = './rules-reference';

async function parsePDF(): Promise<void> {
  console.log('📄 Parsing SRD PDF...');
  
  // Download PDF
  const response = await fetch(PDF_URL);
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }
  
  const pdfBuffer = Buffer.from(await response.arrayBuffer());
  
  // Parse text from PDF
  const data = await pdfParse(pdfBuffer);
  let text = data.text;
  
  // Clean up the text - remove page numbers and headers
  text = text.replace(/\n\d+\n/g, '\n'); // Remove standalone page numbers
  text = text.replace(/System Reference Document[\s\S]*?Contents\n/, ''); // Remove title/contents
  
  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  // Save as searchable JSON (not committed to repo)
  // Store as single document with metadata for easier searching
  const parsedData = {
    source: PDF_URL,
    pages: data.numpages || 'unknown',
    content: text
  };
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'srd-text.json'), JSON.stringify(parsedData, null, 2));
  
  // Also save raw text for grep-style searches
  fs.writeFileSync(path.join(OUTPUT_DIR, 'srd-raw.txt'), text);
  
  console.log(`✅ Parsed ${data.numpages || '?'} pages (${text.length.toLocaleString()} characters)`);
  console.log(`📁 Output saved to: ${OUTPUT_DIR}/`);
  console.log('⚠️  Note: This directory is in .gitignore and will not be committed');
}

parsePDF().catch((error) => {
  console.error('❌ Failed to parse PDF:', error);
  process.exit(1);
});
