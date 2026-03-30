import { v4 as uuidv4 } from 'uuid';

export interface DocumentChunk {
  id: string;
  text: string;
  tokens: string[];
}

// Global in-memory store for the active session.
let globalVectorStore: DocumentChunk[] = [];

// Fast native tokenizer algorithm
function tokenize(text: string): string[] {
  // Lowercase, remove punctuation, split by spaces, filter stop-words heavily (length <= 2)
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
}

export async function addDocumentsToStore(chunks: string[]) {
  if (chunks.length === 0) return;

  // Instead of querying Google Gemini Embeddings API (which enforces limits or throws v1beta errors),
  // we tokenize and index the RAG chunks directly in local Javascript memory instantly.
  const newDocs: DocumentChunk[] = chunks.map((text, i) => ({
    id: uuidv4(),
    text,
    tokens: tokenize(text),
  }));

  // Reset store for every new upload session
  globalVectorStore = newDocs;
  console.log(`[VectorStore] Added ${newDocs.length} chunks to local Token-Search memory.`);
}

export async function searchSimilarDocuments(query: string, topK: number = 5) {
  if (globalVectorStore.length === 0) return [];

  const queryTokens = tokenize(query);
  
  // Calculate a simplified TF-IDF relevance score natively
  const scoredDocs = globalVectorStore.map(doc => {
    let score = 0;
    for (const qToken of queryTokens) {
      const occurrences = doc.tokens.filter(t => t === qToken).length;
      if (occurrences > 0) {
        score += (1 + Math.log(occurrences)); // Logarithmic scaling for term frequency
      }
    }
    return {
      ...doc,
      score,
    };
  });

  // Sort natively descending by calculation score
  scoredDocs.sort((a, b) => b.score - a.score);
  
  // Slice top K most relevant text passages for generation
  return scoredDocs.slice(0, topK);
}
