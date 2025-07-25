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

const ScanMenuForFoodOptionsOutputSchema = z.object({
  foodOptions: z
    .array(z.string())
    .describe('A list of food items identified on the menu.'),
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
  prompt: `You are an AI assistant that extracts food items from a restaurant menu image.

Analyze the provided menu photo and extract only the names of the food items. 
- Do not include section headers, descriptions, or prices.
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
