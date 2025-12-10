'use server';

/**
 * Generates nutritional information for a given food item.
 * Implements the Google GenAI SDK directly with model "gemini-2.5-flash" per user request.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export type GenerateNutritionalDataInput = {
  foodItem: string;
  ingredients?: string;
  restaurantName?: string;
};

export type GenerateNutritionalDataOutput = {
  calories: string;
  carbs: string;
  protein: string;
  fat: string;
  saturatedFat?: string;
  transFat?: string;
  cholesterol?: string;
  sodium?: string;
  sugar?: string;
  fiber?: string;
  ingredients?: string;
  isVegan?: boolean;
  healthRating?: number;
  allergens?: string[];
};

const MODEL_ID = 'gemini-2.5-flash';

export async function generateNutritionalData(input: GenerateNutritionalDataInput): Promise<GenerateNutritionalDataOutput> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GENAI_API_KEY or GEMINI_API_KEY');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_ID });

  const prompt = `You are a nutritional expert. Analyze the provided food item.
If the restaurant name is provided, prioritize looking up the nutritional information from the restaurant's official website.
If the restaurant name is not provided or the information is not available, check to see if some of the information is already present, such as calories or ingredients.
If nutritional information is not available, use your knowledge to estimate the nutritional data.

Your task is to provide the following information:
1.  Nutritional Data: calories, carbs, protein, fat (and optional sub-macros).
2.  Vegan Status: Determine if the food is vegan.
3.  Health Rating: A score from 1 to 10.
4.  Ingredients: If not provided, infer them.
5.  Allergens: Potential allergens from the ingredients.

Return JSON only, in this shape:
{
  "calories": "string",
  "carbs": "string",
  "protein": "string",
  "fat": "string",
  "saturatedFat": "string | optional",
  "transFat": "string | optional",
  "cholesterol": "string | optional",
  "sodium": "string | optional",
  "sugar": "string | optional",
  "fiber": "string | optional",
  "ingredients": "string | optional",
  "isVegan": true|false,
  "healthRating": number,
  "allergens": ["string"]
}`;

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${prompt}

Food Item: ${input.foodItem}
Ingredients: ${input.ingredients ?? 'Not provided'}
Restaurant: ${input.restaurantName ?? 'Not provided'}`,
          },
        ],
      },
    ],
  });

  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse nutritional data');
  }

  return JSON.parse(jsonMatch[0]) as GenerateNutritionalDataOutput;
}