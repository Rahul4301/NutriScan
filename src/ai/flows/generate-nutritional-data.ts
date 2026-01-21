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
  dietaryRestrictions?: string[];
  allergens?: string[];
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
  dietaryViolations?: string[]; // Dietary restrictions this food violates
};

const MODEL_ID = 'gemini-2.5-flash';

export async function generateNutritionalData(input: GenerateNutritionalDataInput): Promise<GenerateNutritionalDataOutput> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GENAI_API_KEY or GEMINI_API_KEY');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_ID });

  const buildDietaryContext = () => {
    let context = '';
    if (input.dietaryRestrictions && input.dietaryRestrictions.length > 0) {
      context += `\n\nIMPORTANT: The user has the following dietary restrictions: ${input.dietaryRestrictions.join(', ')}. `;
      context += `Analyze the food item and its ingredients to determine if it violates any of these restrictions. `;
      context += `If the food item contains or likely contains ingredients that violate a dietary restriction, add that restriction to the "dietaryViolations" array. `;
      context += `For example:\n`;
      context += `- If user is "Vegetarian" and food contains meat/fish, add "Vegetarian" to dietaryViolations\n`;
      context += `- If user is "Vegan" and food contains dairy/eggs/honey, add "Vegan" to dietaryViolations\n`;
      context += `- If user is "Gluten-Free" and food contains wheat/gluten, add "Gluten-Free" to dietaryViolations\n`;
      context += `- If user is "Dairy-Free" and food contains dairy, add "Dairy-Free" to dietaryViolations\n`;
      context += `- If user is "Keto" and food is high in carbs, add "Keto" to dietaryViolations\n`;
      context += `Only add restrictions that are actually violated. If the food is compatible with a restriction, do not add it.`;
    }
    if (input.allergens && input.allergens.length > 0) {
      context += `\n\nIMPORTANT: The user has the following allergens to avoid: ${input.allergens.join(', ')}. `;
      context += `If the food item contains or likely contains any of these allergens (based on ingredients), add the allergen name to the "dietaryViolations" array. `;
      context += `For example, if user avoids "Peanuts" and the food contains peanuts, add "Peanuts" to dietaryViolations.`;
    }
    return context;
  };

  const prompt = `You are a nutritional expert. Analyze the provided food item.
If the restaurant name is provided, prioritize looking up the nutritional information from the restaurant's official website.
If the restaurant name is not provided or the information is not available, check to see if some of the information is already present, such as calories or ingredients.
If nutritional information is not available, use your knowledge to estimate the nutritional data.

Your task is to provide the following information:
1.  Nutritional Data: calories, carbs, protein, fat (and optional sub-macros).
2.  Vegan Status: Determine if the food is vegan.
3.  Health Rating: A score from 1 to 10.
4.  Ingredients: If not provided, infer them.
5.  Allergens: Potential allergens from the ingredients.${buildDietaryContext()}

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
  "allergens": ["string"],
  "dietaryViolations": ["string"] | optional
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
Restaurant: ${input.restaurantName ?? 'Not provided'}${input.dietaryRestrictions ? `\nUser Dietary Restrictions: ${input.dietaryRestrictions.join(', ')}` : ''}${input.allergens ? `\nUser Allergens to Avoid: ${input.allergens.join(', ')}` : ''}`,
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