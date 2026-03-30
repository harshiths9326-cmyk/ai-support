// @ts-nocheck
import { google } from "@ai-sdk/google";
import { streamText, type UIMessage } from "ai";
import { searchSimilarDocuments } from "@/lib/vector-store";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const lastMessage = messages[messages.length - 1];
    
    // Retrieve top 4 most semantically similar chunks based on user question
    const contextDocs = await searchSimilarDocuments(lastMessage.content, 4);
    
    const contextText = contextDocs.map(doc => doc.text).join('\n\n');

    const systemPrompt = `You are a helpful, professional, and precise customer support AI. 
Your primary directive is to answer the user's questions STRICTLY based on the following context derived from an uploaded document.
If the answer is NOT contained in the context or cannot be logically deduced from it, you MUST politely state that you do not have that information based on the provided document.
Do NOT make up answers. Do NOT use outside knowledge.

<context>
${contextText}
</context>`;

    const result = streamText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      messages: messages,
      temperature: 0.2, // Low temperature for more factual responses
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    console.error("Chat Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500 });
  }
}
