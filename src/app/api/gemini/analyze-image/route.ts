import { GoogleGenAI, Type } from "@google/genai";
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

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: image,
                mimeType,
              }
            },
            {
              text: "Analyze this image for a photography portfolio. Generate a selection of metadata."
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A short, descriptive title for the image (max 5 words, title case)."
            },
            description: {
              type: Type.STRING,
              description: "A detailed, evocative 1-2 sentence description for the image."
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 3-7 relevant aesthetic or subject matter tags."
            }
          },
          required: ["title", "description", "tags"]
        }
      }
    });

    const text = response.text || "{}";
    
    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    if (error.status === 503) {
      console.warn("Gemini API Rate Limited (503): Model experiencing high demand.");
    } else {
      console.error("Gemini API Error:", error);
    }
    return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: error.status || 500 });
  }
}
