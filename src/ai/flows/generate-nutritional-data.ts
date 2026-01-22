'use server';

/**
 * Generates nutritional information for a given food item.
 * Implements the Google GenAI SDK directly with model "gemini-2.5-flash" per user request.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import {
  checkIsVegan,
  detectAllergens,
  checkDietaryViolations,
  calculateHealthRating,
  calculateDiabetesWarning,
} from '@/lib/utils/nutrition-helpers';

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
  diabetesWarning?: string; // Warning if net carbs are outside safe range for diabetics
};

const MODEL_ID = 'gemini-2.5-flash';

export async function generateNutritionalData(input: GenerateNutritionalDataInput): Promise<GenerateNutritionalDataOutput> {
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

  // Dietary context removed - these checks are now done manually after AI response

  const prompt = `You are a nutritional expert. Analyze the provided food item.

CRITICAL REQUIREMENTS - You MUST return ALL of the following:
1. Calories: Estimated calories per serving - REQUIRED
2. Protein: Estimated protein in grams (e.g., "25g") - REQUIRED
3. Fat: Estimated fat in grams (e.g., "15g") - REQUIRED
4. Ingredients: List of key ingredients (comma-separated) - REQUIRED
5. Potential Allergens: Common allergens that may be present (array of strings) - REQUIRED

ACCURACY IMPROVEMENTS - Use these strategies to improve accuracy:
1. Brand/Product Lookup: If the food item mentions a brand name (e.g., "Coca-Cola", "Kellogg's", "McDonald's Big Mac"), 
   look up the official nutritional information from that brand's website or nutrition database.
2. Restaurant Lookup: If the restaurant name is provided, prioritize looking up the nutritional information from the 
   restaurant's official website or nutrition database.
3. Product Identification: If the food item appears to be a packaged product, identify the specific product and 
   look up its official nutrition facts label.
4. Database Cross-Reference: Use known nutritional databases (USDA, restaurant nutrition databases) when available.
5. If official data is not available, use your knowledge to estimate based on similar foods and ingredients.

Your task is to provide the following information:
1. Nutritional Data: calories, carbs, protein, fat (and optional sub-macros like saturatedFat, transFat, cholesterol, sodium, sugar, fiber).
2. Ingredients: If not provided, infer them from the food name and description (REQUIRED).
3. Potential Allergens: Common allergens that may be present (REQUIRED - return as array of strings).

Note: Vegan status, health rating, dietary violations, and diabetes warnings are calculated automatically after your response.

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
  "ingredients": "string (comma separated list of ingredients) - REQUIRED",
  "allergens": ["string"] - REQUIRED
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
Restaurant: ${input.restaurantName ?? 'Not provided'}${dietaryRestrictions.length > 0 ? `\nUser Dietary Restrictions: ${dietaryRestrictions.join(', ')}` : ''}${allergens.length > 0 ? `\nUser Allergens to Avoid: ${allergens.join(', ')}` : ''}`,
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

  const parsed = JSON.parse(jsonMatch[0]) as Partial<GenerateNutritionalDataOutput>;
  
  // Apply manual processing to reduce AI costs
  const ingredients = parsed.ingredients || '';
  
  // Calculate vegan status manually
  const isVegan = checkIsVegan(ingredients);
  
  // Detect allergens manually (merge with AI-detected ones)
  const aiAllergens = parsed.allergens || [];
  const detectedAllergens = detectAllergens(ingredients);
  const allAllergens = [...new Set([...aiAllergens, ...detectedAllergens])];
  
  // Calculate health rating manually
  const healthRating = calculateHealthRating({
    calories: parsed.calories,
    fat: parsed.fat,
    saturatedFat: parsed.saturatedFat,
    sugar: parsed.sugar,
    sodium: parsed.sodium,
    fiber: parsed.fiber,
    protein: parsed.protein,
  });
  
  // Check dietary violations manually
  const dietaryViolations = checkDietaryViolations(
    ingredients,
    dietaryRestrictions,
    allergens
  );
  
  // Calculate diabetes warning manually
  const hasDiabetes = dietaryRestrictions.some(r => 
    r.toLowerCase().includes('diabetes') || r.toLowerCase().includes('diabetic')
  ) || false;
  const diabetesWarning = hasDiabetes 
    ? calculateDiabetesWarning(parsed.carbs, parsed.fiber)
    : undefined;
  
  return {
    ...parsed,
    isVegan,
    healthRating,
    allergens: allAllergens,
    dietaryViolations: dietaryViolations.length > 0 ? dietaryViolations : undefined,
    diabetesWarning,
  } as GenerateNutritionalDataOutput;
}