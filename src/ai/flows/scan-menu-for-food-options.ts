'use server';
/**
 * Scans a menu image and identifies food items.
 * Implements the Google GenAI SDK directly with model "gemini-2.5-flash" per user request.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export type ScanMenuForFoodOptionsInput = {
  menuPhotoDataUri: string;
};

export type FoodOption = {
  name: string;
  isVegan: boolean;
};

export type ScanMenuForFoodOptionsOutput = {
  restaurantName?: string;
  foodOptions: FoodOption[];
};

const MODEL_ID = 'gemini-2.5-flash';

export async function scanMenuForFoodOptions(
  input: ScanMenuForFoodOptionsInput
): Promise<ScanMenuForFoodOptionsOutput> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GENAI_API_KEY or GEMINI_API_KEY');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_ID });

  // Extract mime type + base64 payload from data URI
  const match = input.menuPhotoDataUri.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) {
    throw new Error('Invalid menuPhotoDataUri. Expected data:<mime>;base64,<data>');
  }
  const [, mimeType, base64Data] = match;

  const systemPrompt = `You are an AI assistant that extracts food items from a restaurant menu image and determines if they are vegan.

Analyze the provided menu photo and extract the names of the food items and whether they are vegan.
- First, identify the name of the restaurant from the menu.
- For each food item, determine if it is vegan based on its name and description on the menu.
- If the menu explicitly marks an item as vegan (e.g., with a "V" or leaf icon), mark it as vegan.
- If an item is not explicitly marked as vegan but appears to be vegan by its ingredients (e.g., "garden salad"), you can infer it is vegan.
- Do not include section headers, descriptions, or prices in the item name.
- Only return items that are clearly food or drink.
- If you cannot identify any food items, return an empty list.

Return JSON only, in this shape:
{
  "restaurantName": "string | optional",
  "foodOptions": [{"name": "string", "isVegan": true|false}]
}`;

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { text: systemPrompt },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
  });

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    // Fallback: no structured data found
    return { foodOptions: [] };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as ScanMenuForFoodOptionsOutput;
    if (!parsed.foodOptions) parsed.foodOptions = [];
    return parsed;
  } catch (err) {
    console.error('Failed to parse menu JSON', err, text);
    return { foodOptions: [] };
  }
}