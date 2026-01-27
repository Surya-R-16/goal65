import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const RESPONSE_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        transcript: { type: SchemaType.STRING },
        intent: { type: SchemaType.STRING, enum: ["log_food", "unknown"] },
        meal: { type: SchemaType.STRING, enum: ["Breakfast", "Lunch", "Dinner", "Snack"] },
        items: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING },
                    quantity: { type: SchemaType.NUMBER },
                    unit: { type: SchemaType.STRING },
                    calories: { type: SchemaType.NUMBER },
                    protein_g: { type: SchemaType.NUMBER },
                    carbs_g: { type: SchemaType.NUMBER },
                    fat_g: { type: SchemaType.NUMBER },
                    confidence: { type: SchemaType.NUMBER }
                }
            }
        }
    }
};

const SYSTEM_INSTRUCTION = `
You are an expert nutritionist assistant specializing in South Indian cuisine.
Your goal is to listen to the user's audio log about their meals, transcribe it, and extract structured food data.

CRITICAL LINGUISTIC INSTRUCTIONS:
1. The user may speak in English with a South Indian accent or mix Tamil words (Tanglish).
2. Recognize specific South Indian dishes.
3. If the user uses Tamil numbers or measures, process them accurately.

NUTRITION INSTRUCTIONS:
1. ESTIMATE nutritional values based on standard data.
2. MEAL CATEGORIZATION: Infer from time if not specified.

OUTPUT FORMAT:
Return strict JSON matching the schema.
`;

export async function POST(request: Request) {
    try {
        const { audioBase64, mimeType, currentTime } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Server configuration error: API Key missing" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        const client = new GoogleGenerativeAI(apiKey);
        const model = client.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_INSTRUCTION,
        });

        const response = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: audioBase64
                            }
                        },
                        {
                            text: `Analyze this audio log. Current Time: ${currentTime}. Extract food items.`
                        }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA
            }
        });

        return new Response(response.response.text(), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error("API Proxy Error:", error);
        return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
