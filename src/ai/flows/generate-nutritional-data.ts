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
});
export type GenerateNutritionalDataInput = z.infer<typeof GenerateNutritionalDataInputSchema>;

const GenerateNutritionalDataOutputSchema = z.object({
  calories: z.string().describe('The number of calories in the food item.'),
  carbs: z.string().describe('The number of carbohydrates in the food item.'),
  protein: z.string().describe('The amount of protein in the food item.'),
  fat: z.string().describe('The amount of fat in the food item.'),
  saturatedFat: z.string().optional().describe('The amount of saturated fat in the food item, if available.'),
  transFat: z.string().optional().describe('The amount of trans fat in the food item, if available.'),
  cholesterol: z.string().optional().describe('The amount of cholesterol in the food item, if available.'),
  sodium: z.string().optional().describe('The amount of sodium in the food item, if available.'),
  sugar: z.string().optional().describe('The amount of sugar in the food item, if available.'),
  fiber: z.string().optional().describe('The amount of fiber in the food item, if available.'),
  ingredients: z.string().optional().describe('A list of the ingredients, if available.'),
});
export type GenerateNutritionalDataOutput = z.infer<typeof GenerateNutritionalDataOutputSchema>;

export async function generateNutritionalData(input: GenerateNutritionalDataInput): Promise<GenerateNutritionalDataOutput> {
  return generateNutritionalDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNutritionalDataPrompt',
  input: {schema: GenerateNutritionalDataInputSchema},
  output: {schema: GenerateNutritionalDataOutputSchema},
  prompt: `You are a nutritional expert. Generate the nutritional information for the given food item, including calories, carbs, protein, fat, and other available information like saturated fat, trans fat, cholesterol, sodium, sugar and fiber.  If ingredients are provided, use them to improve the nutritional information. Provide ingredient information if it is not already available.

Food Item: {{{foodItem}}}
Ingredients: {{{ingredients}}}

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
