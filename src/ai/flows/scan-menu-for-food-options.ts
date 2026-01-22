'use server';
/**
 * Scans a menu image and identifies food items.
 * Implements the Google GenAI SDK directly with model "gemini-2.5-flash" per user request.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  checkIsVegan,
  detectAllergens,
  checkDietaryViolations,
  calculateHealthRating,
} from '@/lib/utils/nutrition-helpers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getProductNutritionFromRAG } from '@/lib/utils/product-rag';

export type ScanMenuForFoodOptionsInput = {
  menuPhotoDataUri: string;
  dietaryRestrictions?: string[];
  allergens?: string[];
};

export type FoodOption = {
  name: string;
  isVegan: boolean;
  healthRating?: number; // 1-10 health rating
  calories?: string;
  protein?: string;
  fat?: string;
  ingredients?: string;
  potentialAllergens?: string[];
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

  // Fetch user's dietary restrictions and allergens directly from Supabase
  let userDietaryRestrictions: string[] = [];
  let userAllergens: string[] = [];
  
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!authError && user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('dietary_restrictions, allergens')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        userDietaryRestrictions = profile.dietary_restrictions || [];
        userAllergens = profile.allergens || [];
      }
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Continue with empty arrays if profile fetch fails
  }

  // Use fetched restrictions, but allow override from input if provided (for backward compatibility)
  const dietaryRestrictions = input.dietaryRestrictions || userDietaryRestrictions;
  const allergens = input.allergens || userAllergens;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_ID });

  // Extract mime type + base64 payload from data URI
  const match = input.menuPhotoDataUri.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) {
    throw new Error('Invalid menuPhotoDataUri. Expected data:<mime>;base64,<data>');
  }
  const [, mimeType, base64Data] = match;

  // Step 1: Check if this is a single branded product (RAG approach)
  // Try RAG first for product images - if successful, return early
  const ragNutrition = await getProductNutritionFromRAG(input.menuPhotoDataUri, apiKey);
  if (ragNutrition && (ragNutrition.calories || ragNutrition.protein || ragNutrition.carbs || ragNutrition.fat)) {
    // This looks like a single product, use RAG data
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_ID });
    
    // Get product name
    const namePrompt = `Identify the food or product name from this image. Return JSON only: {"name": "string"}`;
    
    try {
      const nameResult = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: namePrompt },
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
      
      const nameText = nameResult.response.text();
      const nameMatch = nameText.match(/\{[\s\S]*\}/);
      const nameData = nameMatch ? JSON.parse(nameMatch[0]) : { name: 'Product' };
      
      const ingredients = ragNutrition.ingredients || '';
      const isVegan = checkIsVegan(ingredients);
      const detectedAllergens = detectAllergens(ingredients);
      const allAllergens = [...new Set([...(ragNutrition.allergens || []), ...detectedAllergens])];
      const healthRating = calculateHealthRating({
        calories: ragNutrition.calories,
        fat: ragNutrition.fat,
        protein: ragNutrition.protein,
        saturatedFat: ragNutrition.saturatedFat,
        sugar: ragNutrition.sugar,
        sodium: ragNutrition.sodium,
        fiber: ragNutrition.fiber,
      });
      const dietaryViolations = checkDietaryViolations(ingredients, dietaryRestrictions, allergens);
      
      return {
        foodOptions: [{
          name: nameData.name || 'Product',
          isVegan,
          healthRating,
          calories: ragNutrition.calories,
          protein: ragNutrition.protein,
          fat: ragNutrition.fat,
          ingredients,
          potentialAllergens: allAllergens,
          dietaryViolations: dietaryViolations.length > 0 ? dietaryViolations : undefined,
        }],
        directFoodAnalysis: {
          name: nameData.name || 'Product',
          isVegan,
          calories: ragNutrition.calories || 'N/A',
          carbs: ragNutrition.carbs || 'N/A',
          protein: ragNutrition.protein || 'N/A',
          fat: ragNutrition.fat || 'N/A',
          dietaryViolations: dietaryViolations.length > 0 ? dietaryViolations : undefined,
        },
      };
    } catch (err) {
      console.error('Error getting product name from RAG:', err);
      // Continue to menu parsing if RAG name detection fails
    }
  }

  // Step 2: If not a single product, try menu parsing
  // Dietary context removed - these checks are now done manually after AI response

  const systemPrompt = `You are an AI assistant that extracts food items from a restaurant menu image and provides comprehensive nutritional analysis.

CRITICAL REQUIREMENTS - You MUST return ALL of the following for each food item:
1. Calories: Estimated calories per serving
2. Protein: Estimated protein in grams (e.g., "25g")
3. Fat: Estimated fat in grams (e.g., "15g")
4. Ingredients: List of key ingredients (comma-separated)
5. Potential Allergens: Common allergens that may be present (e.g., ["Dairy", "Gluten", "Nuts"])

Note: Vegan status, health rating, and dietary violations are calculated automatically after your response.

ACCURACY IMPROVEMENTS:
- Look for brand names, product names, or packaging information visible in the menu image
- If you see a brand name (e.g., "Coca-Cola", "Kellogg's", "McDonald's"), use that to look up accurate nutritional information
- If the restaurant name is visible, prioritize looking up official nutritional data from that restaurant
- Cross-reference ingredients with known nutritional databases when possible
- For packaged products visible in the image, identify the product and use its official nutrition facts

Analyze the provided menu photo:
- First, identify the name of the restaurant from the menu.
- For each food item, extract:
  * Name of the food item
  * Estimated calories
  * Estimated protein (in grams)
  * Estimated fat (in grams)
  * Key ingredients (comma-separated list)
  * Potential allergens (array of strings)
- Do not include section headers, descriptions, or prices in the item name.
- Only return items that are clearly food or drink.
- If you cannot identify any food items, return an empty list.

Return JSON only, in this shape:
{
  "restaurantName": "string | optional",
  "foodOptions": [
    {
      "name": "string",
      "calories": "string (e.g., '350')",
      "protein": "string (e.g., '25g')",
      "fat": "string (e.g., '15g')",
      "ingredients": "string (comma-separated)",
      "potentialAllergens": ["string"]
    }
  ]
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
    return await identifyFoodFromImage(mimeType, base64Data, apiKey, dietaryRestrictions, allergens);
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as ScanMenuForFoodOptionsOutput;
    if (!parsed.foodOptions) parsed.foodOptions = [];
    
    // Apply manual processing to reduce AI costs
    parsed.foodOptions = parsed.foodOptions.map(option => {
      const ingredients = option.ingredients || '';
      
      // Calculate vegan status manually
      const isVegan = checkIsVegan(ingredients);
      
      // Detect allergens manually (merge with AI-detected ones)
      const aiAllergens = option.potentialAllergens || [];
      const detectedAllergens = detectAllergens(ingredients);
      const allAllergens = [...new Set([...aiAllergens, ...detectedAllergens])];
      
      // Calculate health rating manually
      const healthRating = calculateHealthRating({
        calories: option.calories,
        fat: option.fat,
        protein: option.protein,
      });
      
      // Check dietary violations manually
      const dietaryViolations = checkDietaryViolations(
        ingredients,
        dietaryRestrictions,
        allergens
      );
      
      return {
        ...option,
        isVegan,
        healthRating,
        potentialAllergens: allAllergens,
        dietaryViolations: dietaryViolations.length > 0 ? dietaryViolations : undefined,
      };
    });
    
    // If no food options found, try to identify food directly from image
    if (parsed.foodOptions.length === 0) {
      return await identifyFoodFromImage(mimeType, base64Data, apiKey, dietaryRestrictions, allergens);
    }
    
    return parsed;
  } catch (err) {
    console.error('Failed to parse menu JSON', err, text);
    // Try direct food identification as fallback
    return await identifyFoodFromImage(mimeType, base64Data, apiKey, dietaryRestrictions, allergens);
  }
}

async function identifyFoodFromImage(
  mimeType: string,
  base64Data: string,
  apiKey: string,
  dietaryRestrictions: string[] = [],
  allergens: string[] = []
): Promise<ScanMenuForFoodOptionsOutput> {
  // Step 1: Try RAG first - detect brand/product and get accurate macros
  const imageDataUri = `data:${mimeType};base64,${base64Data}`;
  const ragNutrition = await getProductNutritionFromRAG(imageDataUri, apiKey);
  
  // If RAG found product data, use it
  if (ragNutrition && (ragNutrition.calories || ragNutrition.protein || ragNutrition.carbs || ragNutrition.fat)) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_ID });
    
    // Still need to identify the food name
    const namePrompt = `Identify the food or product name from this image. Return JSON only: {"name": "string"}`;
    
    try {
      const nameResult = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: namePrompt },
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
      
      const nameText = nameResult.response.text();
      const nameMatch = nameText.match(/\{[\s\S]*\}/);
      const nameData = nameMatch ? JSON.parse(nameMatch[0]) : { name: 'Product' };
      
      const ingredients = ragNutrition.ingredients || '';
      const isVegan = checkIsVegan(ingredients);
      const detectedAllergens = detectAllergens(ingredients);
      const allAllergens = [...new Set([...(ragNutrition.allergens || []), ...detectedAllergens])];
      const healthRating = calculateHealthRating({
        calories: ragNutrition.calories,
        fat: ragNutrition.fat,
        protein: ragNutrition.protein,
        saturatedFat: ragNutrition.saturatedFat,
        sugar: ragNutrition.sugar,
        sodium: ragNutrition.sodium,
        fiber: ragNutrition.fiber,
      });
      const dietaryViolations = checkDietaryViolations(ingredients, dietaryRestrictions, allergens);
      
      return {
        foodOptions: [{
          name: nameData.name || 'Product',
          isVegan,
          healthRating,
          calories: ragNutrition.calories,
          protein: ragNutrition.protein,
          fat: ragNutrition.fat,
          ingredients,
          potentialAllergens: allAllergens,
          dietaryViolations: dietaryViolations.length > 0 ? dietaryViolations : undefined,
        }],
        directFoodAnalysis: {
          name: nameData.name || 'Product',
          isVegan,
          calories: ragNutrition.calories || 'N/A',
          carbs: ragNutrition.carbs || 'N/A',
          protein: ragNutrition.protein || 'N/A',
          fat: ragNutrition.fat || 'N/A',
          dietaryViolations: dietaryViolations.length > 0 ? dietaryViolations : undefined,
        },
      };
    } catch (err) {
      console.error('Error getting product name:', err);
    }
  }
  
  // Step 2: Fallback to AI estimation if RAG didn't find product
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_ID });

  const foodIdentificationPrompt = `You are a food identification expert. Analyze this image and identify what kind of food or dish it shows.

CRITICAL REQUIREMENTS - You MUST return ALL of the following:
1. Calories: Estimated calories per serving
2. Protein: Estimated protein in grams (e.g., "25g")
3. Fat: Estimated fat in grams (e.g., "15g")
4. Ingredients: List of key ingredients (comma-separated)
5. Potential Allergens: Common allergens that may be present (e.g., ["Dairy", "Gluten", "Nuts"])

Note: Vegan status, health rating, and dietary violations are calculated automatically after your response.

If this is a photo of actual food (not a menu), identify:
1. The type of food or dish (e.g., "Grilled Chicken Salad", "Pasta Carbonara", "Caesar Salad")
2. Estimate the nutritional information (calories, protein, carbs, fat) for a typical serving
3. Key ingredients (comma-separated list)
4. Potential allergens (array of strings)

Return JSON only, in this shape:
{
  "name": "string (food/dish name)",
  "calories": "string (e.g., '350')",
  "protein": "string (e.g., '25g')",
  "carbs": "string (e.g., '30g')",
  "fat": "string (e.g., '15g')",
  "ingredients": "string (comma-separated)",
  "potentialAllergens": ["string"]
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

    const parsed = JSON.parse(jsonMatch[0]) as any;
    if (parsed.name) {
      // Apply manual processing to reduce AI costs
      const ingredients = parsed.ingredients || '';
      
      // Calculate vegan status manually
      const isVegan = checkIsVegan(ingredients);
      
      // Detect allergens manually (merge with AI-detected ones)
      const aiAllergens = parsed.potentialAllergens || [];
      const detectedAllergens = detectAllergens(ingredients);
      const allAllergens = [...new Set([...aiAllergens, ...detectedAllergens])];
      
      // Calculate health rating manually
      const healthRating = calculateHealthRating({
        calories: parsed.calories,
        fat: parsed.fat,
        protein: parsed.protein,
      });
      
      // Check dietary violations manually
      const dietaryViolations = checkDietaryViolations(
        ingredients,
        dietaryRestrictions,
        allergens
      );
      
      return {
        foodOptions: [{
          name: parsed.name,
          isVegan,
          healthRating,
          calories: parsed.calories,
          protein: parsed.protein,
          fat: parsed.fat,
          ingredients: parsed.ingredients,
          potentialAllergens: allAllergens,
          dietaryViolations: dietaryViolations.length > 0 ? dietaryViolations : undefined,
        }],
        directFoodAnalysis: {
          name: parsed.name,
          isVegan,
          calories: parsed.calories || 'N/A',
          carbs: parsed.carbs || 'N/A',
          protein: parsed.protein || 'N/A',
          fat: parsed.fat || 'N/A',
          dietaryViolations: dietaryViolations.length > 0 ? dietaryViolations : undefined,
        },
      };
    }

    return { foodOptions: [] };
  } catch (err) {
    console.error('Failed to identify food from image', err);
    return { foodOptions: [] };
  }
}