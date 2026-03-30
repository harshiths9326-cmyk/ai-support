/**
 * Extracts raw text from uploaded Buffer
 */
export async function parseDocument(fileBuffer: Buffer, mimeType: string, fileName: string = ""): Promise<string> {
  // In a production Next.js environment, we would use an external microservice or 
  // an API like LlamaParse for PDFs, as native Node PDF libraries often conflict with edge and server runtimes.
  
  // Universal text extraction for ALL document types (CSV, Markdown, Code, TXT, JSON, etc.)
  return fileBuffer.toString('utf-8');
}

/**
 * Splits text into manageable chunks with overlap to retain context across boundaries.
 */
export function chunkText(text: string, maxChunkSize = 1000, overlap = 200): string[] {
  // Clean whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  const chunks = [];
  let startIndex = 0;
  
  while (startIndex < cleanText.length) {
    let endIndex = startIndex + maxChunkSize;
    
    // Attempt to slice cleanly at a period or space
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
