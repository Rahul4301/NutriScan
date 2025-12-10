import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Prefer a configurable model and API key so we can switch away from a quota-exhausted model.
// Use the stable numeric code to avoid alias 404s in v1beta.
const model = process.env.GOOGLE_GENAI_MODEL ?? 'googleai/gemini-1.5-flash-002';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY ?? process.env.GEMINI_API_KEY,
    }),
  ],
  model,
});
