'use server';

/**
 * @fileOverview Generates nutritional information for a given food item.
 *
 * - generateNutritionalData - A function that generates the nutritional information for a food item.
 * - GenerateNutritionalDataInput - The input type for the generateNutritionalData function.
 * - GenerateNutritionalDataOutput - The return type for the generateNutritionalData function.
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

export async function generateNutritionalData(input: GenerateNutritionalDataInput): Promise<GenerateNutritionalDataOutput> {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing GOOGLE_GENAI_API_KEY or GEMINI_API_KEY');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = `You are a nutritional expert. Analyze the provided food item.
If the restaurant name is provided, prioritize looking up the nutritional information from the restaurant's official website.
If the restaurant name is not provided or the information is not available, check to see if some of the information is already present, such as calories or ingredients.
If nutritional information is not available, use your knowledge to estimate the nutritional data.

Your task is to provide the following information:
1.  **Nutritional Data**: Generate the nutritional information (calories, carbs, protein, fat, etc.).
2.  **Vegan Status**: Determine if the food is vegan.
3.  **Health Rating**: Provide a health rating from 1 to 10, where 10 is healthiest.
4.  **Ingredients**: If the ingredients are not provided, infer them.
5.  **Allergens**: Identify potential allergens from the ingredients.

DO NOT HALLUCINATE. Be concise with your responses and only include the information requested.
RETURN ONLY THE NUMERICAL VALUES, INGREDIENTS, AND ALLERGENS.

Food Item: ${input.foodItem}
Ingredients: ${input.ingredients || 'Not provided'}
Restaurant: ${input.restaurantName || 'Not provided'}

Return the result as a JSON object with this structure:
{
  "calories": "string",
  "carbs": "string",
  "protein": "string",
  "fat": "string",
  "saturatedFat": "string (optional)",
  "transFat": "string (optional)",
  "cholesterol": "string (optional)",
  "sodium": "string (optional)",
  "sugar": "string (optional)",
  "fiber": "string (optional)",
  "ingredients": "string (optional)",
  "isVegan": boolean,
  "healthRating": number (1-10),
  "allergens": ["string array (optional)"]
}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', text);
      throw new Error('Failed to parse nutritional data');
    }
    
    const parsed = JSON.parse(jsonMatch[0]) as GenerateNutritionalDataOutput;
    return parsed;
  } catch (error) {
    console.error('Error in generateNutritionalData:', error);
    throw error;
  }
}
