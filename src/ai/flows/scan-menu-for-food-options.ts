'use server';
/**
 * Scans a menu image and identifies food items.
 * Implements the Google GenAI SDK directly with model "gemini-2.5-flash" per user request.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export type ScanMenuForFoodOptionsInput = {
  menuPhotoDataUri: string;
  dietaryRestrictions?: string[];
  allergens?: string[];
};

export type FoodOption = {
  name: string;
  isVegan: boolean;
  dietaryViolations?: string[]; // Dietary restrictions this food violates
};

export type ScanMenuForFoodOptionsOutput = {
  restaurantName?: string;
  foodOptions: FoodOption[];
  directFoodAnalysis?: {
    name: string;
    isVegan: boolean;
    calories: string;
    carbs: string;
    protein: string;
    fat: string;
    dietaryViolations?: string[];
  };
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

  const buildDietaryContext = () => {
    let context = '';
    if (input.dietaryRestrictions && input.dietaryRestrictions.length > 0) {
      context += `\n\nIMPORTANT: The user has the following dietary restrictions: ${input.dietaryRestrictions.join(', ')}. `;
      context += `For each food item, check if it violates any of these restrictions. `;
      context += `If a food item contains or likely contains ingredients that violate a dietary restriction, add that restriction to the "dietaryViolations" array. `;
      context += `For example, if the user is vegetarian and a food item contains meat, add "Vegetarian" to dietaryViolations. `;
      context += `If the user is vegan and a food item contains dairy or eggs, add "Vegan" to dietaryViolations. `;
      context += `If the user is gluten-free and a food item contains wheat/gluten, add "Gluten-Free" to dietaryViolations.`;
    }
    if (input.allergens && input.allergens.length > 0) {
      context += `\n\nIMPORTANT: The user has the following allergens to avoid: ${input.allergens.join(', ')}. `;
      context += `If a food item contains or likely contains any of these allergens, add the allergen name to the "dietaryViolations" array.`;
    }
    return context;
  };

  const systemPrompt = `You are an AI assistant that extracts food items from a restaurant menu image and determines if they are vegan.

Analyze the provided menu photo and extract the names of the food items and whether they are vegan.
- First, identify the name of the restaurant from the menu.
- For each food item, determine if it is vegan based on its name and description on the menu.
- If the menu explicitly marks an item as vegan (e.g., with a "V" or leaf icon), mark it as vegan.
- If an item is not explicitly marked as vegan but appears to be vegan by its ingredients (e.g., "garden salad"), you can infer it is vegan.
- Do not include section headers, descriptions, or prices in the item name.
- Only return items that are clearly food or drink.
- If you cannot identify any food items, return an empty list.${buildDietaryContext()}

Return JSON only, in this shape:
{
  "restaurantName": "string | optional",
  "foodOptions": [{"name": "string", "isVegan": true|false, "dietaryViolations": ["string"] | optional}]
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
    // Fallback: no structured data found, try direct food identification
    return await identifyFoodFromImage(mimeType, base64Data, apiKey);
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as ScanMenuForFoodOptionsOutput;
    if (!parsed.foodOptions) parsed.foodOptions = [];
    
    // If no food options found, try to identify food directly from image
    if (parsed.foodOptions.length === 0) {
      return await identifyFoodFromImage(mimeType, base64Data, apiKey);
    }
    
    return parsed;
  } catch (err) {
    console.error('Failed to parse menu JSON', err, text);
    // Try direct food identification as fallback
    return await identifyFoodFromImage(mimeType, base64Data, apiKey);
  }
}

async function identifyFoodFromImage(
  mimeType: string,
  base64Data: string,
  apiKey: string
): Promise<ScanMenuForFoodOptionsOutput> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_ID });

  const foodIdentificationPrompt = `You are a food identification expert. Analyze this image and identify what kind of food or dish it shows.

If this is a photo of actual food (not a menu), identify:
1. The type of food or dish (e.g., "Grilled Chicken Salad", "Pasta Carbonara", "Caesar Salad")
2. Whether it appears to be vegan
3. Estimate the nutritional information (calories, protein, carbs, fat) for a typical serving

Return JSON only, in this shape:
{
  "name": "string (food/dish name)",
  "isVegan": true|false,
  "calories": "string (e.g., '350')",
  "protein": "string (e.g., '25g')",
  "carbs": "string (e.g., '30g')",
  "fat": "string (e.g., '15g')"
}`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: foodIdentificationPrompt },
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
      return { foodOptions: [] };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.name) {
      return {
        foodOptions: [{
          name: parsed.name,
          isVegan: parsed.isVegan || false,
          dietaryViolations: parsed.dietaryViolations || [],
        }],
        directFoodAnalysis: {
          name: parsed.name,
          isVegan: parsed.isVegan || false,
          calories: parsed.calories || 'N/A',
          carbs: parsed.carbs || 'N/A',
          protein: parsed.protein || 'N/A',
          fat: parsed.fat || 'N/A',
          dietaryViolations: parsed.dietaryViolations || [],
        },
      };
    }

    return { foodOptions: [] };
  } catch (err) {
    console.error('Failed to identify food from image', err);
    return { foodOptions: [] };
  }
}