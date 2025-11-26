'use server';
/**
 * @fileOverview Scans a menu image and identifies food items.
 *
 * - scanMenuForFoodOptions - A function that handles the menu scanning process.
 * - ScanMenuForFoodOptionsInput - The input type for the scanMenuForFoodOptions function.
 * - ScanMenuForFoodOptionsOutput - The return type for the scanMenuForFoodOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScanMenuForFoodOptionsInputSchema = z.object({
  menuPhotoDataUri: z
    .string()
    .describe(
      "A photo of a restaurant menu, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ScanMenuForFoodOptionsInput = z.infer<typeof ScanMenuForFoodOptionsInputSchema>;

const FoodOptionSchema = z.object({
  name: z.string().describe('The name of the food item.'),
  isVegan: z.boolean().describe('Whether the food item is vegan.'),
});

const ScanMenuForFoodOptionsOutputSchema = z.object({
  restaurantName: z.string().optional().describe('The name of the restaurant, if identifiable.'),
  foodOptions: z
    .array(FoodOptionSchema)
    .describe('A list of food items identified on the menu, with vegan status.'),
});
export type ScanMenuForFoodOptionsOutput = z.infer<typeof ScanMenuForFoodOptionsOutputSchema>;

export async function scanMenuForFoodOptions(
  input: ScanMenuForFoodOptionsInput
): Promise<ScanMenuForFoodOptionsOutput> {
  return scanMenuForFoodOptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scanMenuForFoodOptionsPrompt',
  input: {schema: ScanMenuForFoodOptionsInputSchema},
  output: {schema: ScanMenuForFoodOptionsOutputSchema},
  prompt: `You are an AI assistant that extracts food items from a restaurant menu image and determines if they are vegan.

Analyze the provided menu photo and extract the names of the food items and whether they are vegan.
- First, identify the name of the restaurant from the menu.
- For each food item, determine if it is vegan based on its name and description on the menu.
- Check if the menu provides any nutritional information, such as calories or ingredients.
- If the menu explicitly marks an item as vegan (e.g., with a 'V' or leaf icon), mark it as vegan.
- If an item is not explicitly marked as vegan but appears to be vegan by its ingredients (e.g., "garden salad"), you can infer it is vegan.
- Do not include section headers, descriptions, or prices in the item name.
- Only return items that are clearly food or drink.
- If you cannot identify any food items, return an empty list.

Menu Photo: {{media url=menuPhotoDataUri}}`,
});

const scanMenuForFoodOptionsFlow = ai.defineFlow(
  {
    name: 'scanMenuForFoodOptionsFlow',
    inputSchema: ScanMenuForFoodOptionsInputSchema,
    outputSchema: ScanMenuForFoodOptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
