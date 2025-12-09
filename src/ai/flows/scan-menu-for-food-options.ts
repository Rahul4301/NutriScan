'use server';
/**
 * @fileOverview Scans a menu image and identifies food items.
 *
 * - scanMenuForFoodOptions - A function that handles the menu scanning process.
 * - ScanMenuForFoodOptionsInput - The input type for the scanMenuForFoodOptions function.
 * - ScanMenuForFoodOptionsOutput - The return type for the scanMenuForFoodOptions function.
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

export async function scanMenuForFoodOptions(
  input: ScanMenuForFoodOptionsInput
): Promise<ScanMenuForFoodOptionsOutput> {
  try {
    console.log('Starting menu scan...');
    
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing GOOGLE_GENAI_API_KEY or GEMINI_API_KEY');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    // Extract base64 data from data URI
    const base64Match = input.menuPhotoDataUri.match(/^data:([^;]+);base64,(.*)$/);
    if (!base64Match) {
      throw new Error('Invalid data URI format');
    }
    
    const mimeType = base64Match[1];
    const base64Data = base64Match[2];
    
    const prompt = `You are an AI assistant that extracts food items from a restaurant menu image and determines if they are vegan.

Analyze the provided menu photo and extract the names of the food items and whether they are vegan.
- First, identify the name of the restaurant from the menu.
- For each food item, determine if it is vegan based on its name and description on the menu.
- Check if the menu provides any nutritional information, such as calories or ingredients.
- If the menu explicitly marks an item as vegan (e.g., with a 'V' or leaf icon), mark it as vegan.
- If an item is not explicitly marked as vegan but appears to be vegan by its ingredients (e.g., "garden salad"), you can infer it is vegan.
- Do not include section headers, descriptions, or prices in the item name.
- Only return items that are clearly food or drink.
- If you cannot identify any food items, return an empty list.

Return the result as a JSON object with this structure:
{
  "restaurantName": "Restaurant Name (optional)",
  "foodOptions": [
    {"name": "Food Item Name", "isVegan": true/false}
  ]
}`;
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Data
        }
      }
    ]);
    
    const response = result.response;
    const text = response.text();
    
    // Parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', text);
      return { foodOptions: [] };
    }
    
    const parsed = JSON.parse(jsonMatch[0]) as ScanMenuForFoodOptionsOutput;
    console.log('Menu scan successful:', parsed);
    return parsed;
  } catch (error) {
    console.error('Error in scanMenuForFoodOptions:', error);
    throw error;
  }
}
