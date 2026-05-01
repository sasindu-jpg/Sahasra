import { GoogleGenAI, Type } from "@google/genai";

export interface OrderData {
  orderNumber: string;
  customerName: string;
  address: string;
  orderDescription: string;
  phone1: string;
  phone2: string;
  codAmount: string;
}

export async function extractOrderDetails(base64Image: string, mimeType: string, customApiKey?: string): Promise<OrderData[]> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("Gemini API Key is missing. Please configure it in Settings.");
  }

  const ai = new GoogleGenAI(apiKey);
  const prompt = `Analyze this photo and extract order details.
  The first column is the Order Number (use 133169 as default if none found), 
  the second is the Customer Name (exact name, use FB profile name if only available), 
  third is the Address, 
  fourth is the Order Description (strictly "MEDICINE"), 
  fifth is the First Phone Number (strictly no +94 or leading 0), 
  sixth is the Second Phone Number (strictly no +94 or leading 0, use "-" if unavailable), 
  and seventh is the price (COD Amount).
  
  STRICT RULES:
  - All text in every field must be UPPERCASE ENGLISH.
  - NO SINHALA text anywhere in the JSON output.
  - Formatted phone numbers (no +94, no leading 0).
  - Return ONLY a valid JSON array of objects.`;

  try {
    const response = await ai.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent({
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image, mimeType } }
        ]
      }],
      generationConfig: {
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
              codAmount: { type: Type.STRING }
            },
            required: ["orderNumber", "customerName", "address", "orderDescription", "phone1", "phone2", "codAmount"]
          }
        }
      }
    });

    const text = response.response.text();
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Extraction Error:", error);
    throw error;
  }
}
