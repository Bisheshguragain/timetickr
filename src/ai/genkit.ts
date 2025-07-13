import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI(),
    // The @genkit-ai/next plugin is not needed for this dev setup and was causing build issues.
    // CORS is handled directly below.
  ],
  model: 'googleai/gemini-2.0-flash',
  // We need to allow requests from the Next.js dev server (localhost:9002)
  // to the Genkit dev server (localhost:4000). In production, this must be updated.
  cors: {
    origin: [
      'http://localhost:9002', // For local development
      process.env.NEXT_PUBLIC_APP_URL || 'https://your-production-app-url.com', // For production
    ],
  },
});
