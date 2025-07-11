'use server';

/**
 * @fileOverview An AI agent for generating presentation content.
 *
 * - generateSpeech - A function that generates speech content based on a topic.
 * - GenerateSpeechInput - The input type for the generateSpeech function.
 * - GenerateSpeechOutput - The return type for the generateSpeech function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateSpeechInputSchema = z.object({
  topic: z.string().describe('The topic of the presentation.'),
});
export type GenerateSpeechInput = z.infer<typeof GenerateSpeechInputSchema>;

const GenerateSpeechOutputSchema = z.object({
  title: z.string().describe('A catchy and relevant title for the presentation.'),
  openingStatement: z
    .string()
    .describe('An engaging opening statement to capture the audience attention.'),
  outline: z
    .array(z.string())
    .describe('A list of key talking points or sections for the presentation outline.'),
});
export type GenerateSpeechOutput = z.infer<typeof GenerateSpeechOutputSchema>;

export async function generateSpeech(
  input: GenerateSpeechInput
): Promise<GenerateSpeechOutput> {
  return generateSpeechFlow(input);
}

const generateSpeechPrompt = ai.definePrompt({
  name: 'generateSpeechPrompt',
  input: { schema: GenerateSpeechInputSchema },
  output: { schema: GenerateSpeechOutputSchema },
  prompt: `You are an expert speechwriter and presentation coach. A user needs help preparing a presentation on the following topic: {{{topic}}}.

Your task is to generate the following content for them:
1.  A catchy and professional title for the presentation.
2.  A powerful, engaging opening statement (2-3 sentences) to grab the audience's attention.
3.  A clear, structured outline with 3-5 main talking points.

Provide the response in the requested structured format.`,
});

const generateSpeechFlow = ai.defineFlow(
  {
    name: 'generateSpeechFlow',
    inputSchema: GenerateSpeechInputSchema,
    outputSchema: GenerateSpeechOutputSchema,
  },
  async (input) => {
    const { output } = await generateSpeechPrompt(input);
    return output!;
  }
);
