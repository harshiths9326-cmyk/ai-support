import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { searchSimilarDocumentsStateless } from "@/lib/vector-store";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("CRITICAL: Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable in Vercel settings.");
    }

    const google = createGoogleGenerativeAI({ apiKey });
    
    const body = await req.json();
    const messages = body.messages as any[];
    const lastMessage = messages[messages.length - 1];
    
    let contextText = "";
    try {
      const documentChunks = body.documentChunks || [];
      const contextDocs = await searchSimilarDocumentsStateless(lastMessage.content, documentChunks, 4);
      contextText = contextDocs.map(doc => doc.text).join('\n\n');
    } catch (e) {
      console.error("Vector store failed, using empty context log:", e);
    }

    const systemPrompt = `You are a helpful, professional, and precise customer support AI. 
Your primary directive is to answer the user's questions STRICTLY based on the following context derived from an uploaded document.
If the answer is NOT contained in the context or cannot be logically deduced from it, you MUST politely state that you do not have that information based on the provided document.

<context>
${contextText}
</context>`;

    const result = await generateText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      messages: messages,
      temperature: 0.2, 
    });

    return NextResponse.json({ text: result.text });
  } catch (error: any) {
    console.error("API Chat Route Error:", error);
    return NextResponse.json({ error: error.message || "Unknown server error" }, { status: 500 });
  }
}
