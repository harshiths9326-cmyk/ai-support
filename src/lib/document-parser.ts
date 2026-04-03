const pdfParse = require("pdf-parse");

export async function parseDocument(fileBuffer: Buffer, mimeType: string, fileName: string = ""): Promise<string> {
  if (mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    try {
      const pdfData = await pdfParse(fileBuffer);
      return pdfData.text;
    } catch (e) {
      console.error("PDF parse failed", e);
      throw new Error("Failed to read PDF. Ensure it is not corrupted.");
    }
  }
  return fileBuffer.toString('utf-8');
}

export function chunkText(text: string, maxChunkSize = 1000, overlap = 200): string[] {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const chunks = [];
  let startIndex = 0;
  
  while (startIndex < cleanText.length) {
    let endIndex = startIndex + maxChunkSize;
    if (endIndex < cleanText.length) {
      let tempIndex = cleanText.lastIndexOf('.', endIndex);
      if (tempIndex > startIndex + maxChunkSize / 2) {
        endIndex = tempIndex + 1;
      } else {
        tempIndex = cleanText.lastIndexOf(' ', endIndex);
        if (tempIndex > startIndex + maxChunkSize / 2) {
          endIndex = tempIndex;
        }
      }
    }
    chunks.push(cleanText.slice(startIndex, endIndex).trim());
    startIndex = endIndex - overlap;
  }
  return chunks;
}
