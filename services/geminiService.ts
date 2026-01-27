
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { FoodItem, MealType, UserSettings } from "../types";

// In a real production app, we would proxy this through a backend.
// For this PWA demo, we use the client-side SDK directly.
const getClient = () => {
  const apiKey = process.env.API_KEY;
  console.log("DEBUG: API Key available?", !!apiKey, "Length:", apiKey?.length);
  if (!apiKey) {
    throw new Error("API Key not found. Please set the API_KEY environment variable.");
  }
  return new GoogleGenerativeAI(apiKey);
};

// Prompt to handle audio analysis, NLU, and nutrition estimation in one go for efficiency
const SYSTEM_INSTRUCTION = `
You are an expert nutritionist assistant specializing in South Indian cuisine (Tamil Nadu context).
Your goal is to listen to the user's audio log about their meals, transcribe it, and extract structured food data.

CRITICAL LINGUISTIC INSTRUCTIONS:
1. The user may speak in English with a South Indian accent or mix Tamil words (Tanglish).
2. Recognize specific South Indian dishes (e.g., 'Idli', 'Dosai', 'Sambar', 'Rasam', 'Poriyal', 'Kootu', 'Thayir Sadam', 'Vadai', 'Pongal').
3. If the user uses Tamil numbers or measures (e.g., 'rendu idli', 'oru cup'), translate and process them accurately.

NUTRITION INSTRUCTIONS:
1. ESTIMATE the nutritional values (calories, protein, carbs, fat) for the extracted items based on standard data, adapted for Indian preparation methods.
2. MEAL CATEGORIZATION:
   - If the user explicitly mentions a meal (e.g., "for breakfast"), use it.
   - If NOT mentioned, infer it strictly from the "Current Time" provided in the prompt:
     * 05:00 - 11:00 -> Breakfast
     * 11:00 - 15:00 -> Lunch
     * 15:00 - 19:00 -> Snack
     * 19:00 - 23:00 -> Dinner
     * 23:00 - 05:00 -> Snack

OUTPUT FORMAT:
Return strict JSON matching the schema.
`;

const RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    transcript: { type: SchemaType.STRING, description: "Verbatim transcript of the user audio." },
    intent: { type: SchemaType.STRING, enum: ["log_food", "unknown"], description: "The user's intent." },
    meal: { type: SchemaType.STRING, enum: ["Breakfast", "Lunch", "Dinner", "Snack"], description: "The meal time." },
    items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, description: "Name of the dish in English (e.g., 'Curd Rice' for 'Thayir Sadam')" },
          quantity: { type: SchemaType.NUMBER },
          unit: { type: SchemaType.STRING },
          calories: { type: SchemaType.NUMBER, description: "Estimated calories" },
          protein_g: { type: SchemaType.NUMBER },
          carbs_g: { type: SchemaType.NUMBER },
          fat_g: { type: SchemaType.NUMBER },
          confidence: { type: SchemaType.NUMBER, description: "Confidence score 0-1" }
        }
      }
    }
  }
};

export async function analyzeAudioLog(audioBase64: string, mimeType: string): Promise<{
  transcript: string;
  meal: MealType;
  items: FoodItem[];
}> {
  const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

  try {
    let resultText = "";

    if (import.meta.env.DEV) {
      console.log("Dev Mode: Using Client SDK");
      const client = getClient();
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
                text: `Analyze this audio log. Current Time: ${currentTime}. Extract food items, estimate nutrition, and determine meal type based on time if not specified.`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA
        }
      });
      resultText = response.response.text() || "";
    } else {
      // Production: Use Secure Proxy
      console.log("Production Mode: Using Serverless Proxy");
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audioBase64,
          mimeType,
          currentTime
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to analyze audio");
      }
      resultText = await response.text();
    }

    console.log("DEBUG: Raw Gemini Response:", resultText); // Log raw text

    if (!resultText) throw new Error("Empty response from Gemini");
    const parsed = JSON.parse(resultText);
    console.log("DEBUG: Parsed JSON:", parsed); // Log parsed object

    return {
      transcript: parsed.transcript || "No transcript available",
      meal: (parsed.meal as MealType) || MealType.Snack,
      items: (parsed.items || []).map((item: any) => ({
        ...item,
        id: crypto.randomUUID(), // Generate ID on client
      }))
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function generateHealthTip(dailyLogs: any[], settings: UserSettings): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const userContext = `
    User Profile:
    - Name: ${settings.name}
    - Goal: ${settings.goal} weight
    - Preference: ${settings.dietaryPreference || 'South Indian'}
    - Target: ${settings.dailyCalorieTarget} kcal
  `;

  const prompt = `
    ${userContext}
    Based on the following food logs for today, provide ONE short, actionable, and friendly health tip (max 25 words).
    Context: South Indian diet.
    Logs: ${JSON.stringify(dailyLogs)}
    
    If logs are empty, give a generic tip relevant to their goal (${settings.goal}).
  `;

  try {
    const response = await model.generateContent(prompt);
    return response.response.text() || "Drink more water today!";
  } catch (e) {
    return "Stay hydrated and eat balanced meals!";
  }
}

export async function generateDailyAnalysis(dailyLogs: any[], settings: UserSettings): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    User Profile: ${settings.name}, Goal: ${settings.goal}, Target: ${settings.dailyCalorieTarget} kcal.
    Analyze these food logs for today (South Indian context):
    ${JSON.stringify(dailyLogs)}
    
    Provide a 2-3 sentence friendly analysis. 
    1. Acknowledge what they did well.
    2. Suggest a small improvement for tomorrow (e.g., less rice, more protein).
    3. Keep it encouraging.
  `;

  try {
    const response = await model.generateContent(prompt);
    return response.response.text() || "Good job tracking today! Keep focused on your goals.";
  } catch (e) {
    return "Unable to generate analysis right now.";
  }
}
