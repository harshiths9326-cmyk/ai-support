import { NextRequest, NextResponse } from "next/server";
import { parseDocument, chunkText } from "@/lib/document-parser";
import { addDocumentsToStore } from "@/lib/vector-store";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const text = await parseDocument(buffer, file.type, file.name);
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from document" }, { status: 400 });
    }

    const chunks = chunkText(text, 1500, 300); // 1500 chars per chunk
    await addDocumentsToStore(chunks);

    return NextResponse.json({ success: true, chunks: chunks.length });
  } catch (error: unknown) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to process document" }, { status: 500 });
  }
}
