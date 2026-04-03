import { v4 as uuidv4 } from 'uuid';

export interface DocumentChunk {
  id: string;
  text: string;
  tokens: string[];
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
}

// Stateless TF-IDF Search Algorithm
export async function searchSimilarDocumentsStateless(query: string, chunks: string[], topK: number = 5) {
  if (!chunks || chunks.length === 0) return [];

  const documentChunks: DocumentChunk[] = chunks.map((text) => ({
    id: uuidv4(),
    text,
    tokens: tokenize(text),
  }));

  const queryTokens = tokenize(query);
  
  const scoredDocs = documentChunks.map(doc => {
    let score = 0;
    for (const qToken of queryTokens) {
      const occurrences = doc.tokens.filter(t => t === qToken).length;
      if (occurrences > 0) {
        score += (1 + Math.log(occurrences)); 
      }
    }
    return {
      ...doc,
      score,
    };
  });

  scoredDocs.sort((a, b) => b.score - a.score);
  return scoredDocs.slice(0, topK);
}
