import { GoogleGenAI, SchemaType } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }

    const { image, mimeType } = await req.json();

    if (!image || !mimeType) {
      return NextResponse.json({ error: "Missing image data or mime type" }, { status: 400 });
    }

    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Using 1.5 flash which is modern and fast
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            title: {
              type: SchemaType.STRING,
              description: "A short, descriptive title for the image (max 5 words, title case)."
            },
            description: {
              type: SchemaType.STRING,
              description: "A detailed, evocative 1-2 sentence description for the image."
            },
            tags: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "A list of 3-7 relevant aesthetic or subject matter tags."
            }
          },
          required: ["title", "description", "tags"]
        }
      }
    });

    const prompt = "Analyze this image for a photography portfolio. Generate a selection of metadata.";

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: image
        }
      },
      prompt
    ]);

    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 });
  }
}
