'use server';

/**
 * @fileOverview An AI-powered content moderation agent.
 *
 * - moderateMessage - A function that moderates a given message.
 * - ModerateMessageInput - The input type for the moderateMessage function.
 * - ModerateMessageOutput - The return type for the moderateMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateMessageInputSchema = z.object({
  message: z.string().describe('The message to be moderated.'),
});
export type ModerateMessageInput = z.infer<typeof ModerateMessageInputSchema>;

const ModerateMessageOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the message is safe or not.'),
  reason: z.string().describe('The reason for the moderation decision.'),
});
export type ModerateMessageOutput = z.infer<typeof ModerateMessageOutputSchema>;

export async function moderateMessage(input: ModerateMessageInput): Promise<ModerateMessageOutput> {
  return moderateMessageFlow(input);
}

const moderationPrompt = ai.definePrompt({
  name: 'moderationPrompt',
  input: {schema: ModerateMessageInputSchema},
  output: {schema: ModerateMessageOutputSchema},
  prompt: `You are an AI content moderator responsible for ensuring that messages displayed on speaker screens are professional and appropriate. 

You will receive a message and must determine if it contains any offensive language, inappropriate content, or violates any content policies.

Based on your assessment, set the isSafe output field to true if the message is safe and appropriate, and false if it is not. Provide a clear and concise reason for your decision in the reason output field.

Message: {{{message}}}`,
});

const moderateMessageFlow = ai.defineFlow(
  {
    name: 'moderateMessageFlow',
    inputSchema: ModerateMessageInputSchema,
    outputSchema: ModerateMessageOutputSchema,
  },
  async input => {
    const {output} = await moderationPrompt(input);
    return output!;
  }
);
