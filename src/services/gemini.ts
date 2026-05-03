import { GoogleGenAI, Type } from "@google/genai";

export interface OrderData {
  orderNumber: string;
  customerName: string;
  address: string;
  orderDescription: string;
  phone1: string;
  phone2: string;
  codAmount: string;
  city: string;
  remarks: string;
}

export async function extractOrderDetails(base64Image: string, mimeType: string, customApiKey?: string): Promise<OrderData[]> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("Gemini API Key is missing. Please configure it in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Analyze this photo and extract order details.
  - Order Number (use sequentially if not found, but try to extract)
  - Customer Name (exact name, uppercase)
  - Address (uppercase)
  - Order Description (strictly "MEDICINE")
  - First Phone Number (no +94, no leading 0)
  - Second Phone Number (no +94, no leading 0, use "-" if unavailable)
  - COD Amount (price)
  - City (strictly use "" - an empty string)
  - Remarks (strictly use "" - an empty string)
  
  STRICT RULES:
  - All text in every field must be UPPERCASE ENGLISH.
  - NO SINHALA text anywhere in the JSON output.
  - Formatted phone numbers (no +94, no leading 0).
  - Return ONLY a valid JSON array of objects.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image, mimeType } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              orderNumber: { type: Type.STRING },
              customerName: { type: Type.STRING },
              address: { type: Type.STRING },
              orderDescription: { type: Type.STRING },
              phone1: { type: Type.STRING },
              phone2: { type: Type.STRING },
              codAmount: { type: Type.STRING },
              city: { type: Type.STRING },
              remarks: { type: Type.STRING }
            },
            required: ["orderNumber", "customerName", "address", "orderDescription", "phone1", "phone2", "codAmount", "city", "remarks"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Extraction Error:", error);
    throw error;
  }
}
