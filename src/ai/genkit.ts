import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

console.log('Initializing Genkit with API key:', process.env.GOOGLE_GENAI_API_KEY ? 'KEY PRESENT' : 'KEY MISSING');

export const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
  })],
  model: 'gemini-2.5-flash',
});
