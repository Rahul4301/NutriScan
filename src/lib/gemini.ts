import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing env.GEMINI_API_KEY');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeNutrition(menuText: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
      Analyze the following menu item and provide nutritional information:
      ${menuText}
      
      Please provide:
      1. Estimated calories
      2. Macronutrients (protein, carbs, fats)
      3. Key ingredients
      4. Any potential allergens
      5. Dietary categories (vegetarian, vegan, gluten-free, etc.)
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing nutrition:', error);
    throw error;
  }
}
