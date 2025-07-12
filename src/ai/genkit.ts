import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {next} from '@genkit-ai/next/plugin';

export const ai = genkit({
  plugins: [
    googleAI(),
    next({
      // By default, the dev server will be served on port 4000.
      // We can configure the port if we want to.
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
  // We need to allow requests from the Next.js dev server.
  // This is required for the browser to be able to make requests to the Genkit dev server.
  cors: {
    origin: '*', // In production, you should restrict this to your app's domain.
  },
});
