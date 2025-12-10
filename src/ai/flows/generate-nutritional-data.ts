'use server';

/**
 * @fileOverview Generates nutritional information for a given food item.
 *
 * - generateNutritionalData - A function that generates the nutritional information for a food item.
 * - GenerateNutritionalDataInput - The input type for the generateNutritionalData function.
 * - GenerateNutritionalDataOutput - The return type for the generateNutritionalData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNutritionalDataInputSchema = z.object({
  foodItem: z.string().describe('The name of the food item to generate nutritional information for.'),
  ingredients: z.string().optional().describe('The ingredients of the food item, if available.'),
  restaurantName: z.string().optional().describe('The name of the restaurant, if available.'),
});
export type GenerateNutritionalDataInput = z.infer<typeof GenerateNutritionalDataInputSchema>;

const GenerateNutritionalDataOutputSchema = z.object({
  calories: z.string().describe('The number of calories in the food item. Try to estimate the calories based on the ingredients and food item.'),
  carbs: z.string().describe('The number of carbohydrates in the food item. Try to estimate the carbs based on the ingredients and food item.'),
  protein: z.string().describe('The amount of protein in the food item. Try to estimate the protein based on the ingredients and food item.'),
  fat: z.string().describe('The amount of fat in the food item. Try to estimate the fat based on the ingredients and food item. Be super concise and just get the number'),
  saturatedFat: z.string().optional().describe('The amount of saturated fat in the food item, if available. Only return the number.'),
  transFat: z.string().optional().describe('Only return the numerical value for transfats and round to 2 decimal places. The amount of trans fat in the food item, if available.'),
  cholesterol: z.string().optional().describe('The amount of cholesterol in the food item, if available. Be super concise and just get the number'),
  sodium: z.string().optional().describe('The amount of sodium in the food item, if available. Be super concise and just get the number'),
  sugar: z.string().optional().describe('The amount of sugar in the food item, if available. Be super concise and just get the number'),
  fiber: z.string().optional().describe('The amount of fiber in the food item, if available. Be super concise and just get the number'),
  ingredients: z.string().optional().describe('A list of the ingredients, if available. Be concise and just list the ingredients. If not available, infer them based on the food item.'),
  isVegan: z.boolean().optional().describe('Whether the food item is vegan. Assume based off of the name and what you know about the food.'),
  healthRating: z.number().optional().describe('A health rating out of 10 for the food item, assume based on the food name. 10 is healthiest, 1 is least healthy.'),
  allergens: z.array(z.string()).optional().describe('A list of potential allergens in the food item. Be concise and just list the possible allergens. if there are none, return none.'),
});
export type GenerateNutritionalDataOutput = z.infer<typeof GenerateNutritionalDataOutputSchema>;

export async function generateNutritionalData(input: GenerateNutritionalDataInput): Promise<GenerateNutritionalDataOutput> {
  return generateNutritionalDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNutritionalDataPrompt',
  input: {schema: GenerateNutritionalDataInputSchema},
  output: {schema: GenerateNutritionalDataOutputSchema},
  prompt: `You are a nutritional expert. Analyze the provided food item.
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

Food Item: {{{foodItem}}}
Ingredients: {{{ingredients}}}
Restaurant: {{{restaurantName}}}

Nutritional Information: `,
});

const generateNutritionalDataFlow = ai.defineFlow(
  {
    name: 'generateNutritionalDataFlow',
    inputSchema: GenerateNutritionalDataInputSchema,
    outputSchema: GenerateNutritionalDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
      }
);