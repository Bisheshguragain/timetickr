'use server';

/**
 * @fileOverview An AI agent for generating timed alerts for presentations.
 *
 * - generateAlerts - A function that creates a schedule of alerts.
 * - GenerateAlertsInput - The input type for the generateAlerts function.
 * - GenerateAlertsOutput - The return type for the generateAlerts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateAlertsInputSchema = z.object({
  durationInMinutes: z
    .number()
    .positive()
    .describe('The total duration of the presentation in minutes.'),
});
export type GenerateAlertsInput = z.infer<typeof GenerateAlertsInputSchema>;

const AlertSchema = z.object({
    time: z.number().describe("The time in seconds from the start of the presentation when the alert should be sent."),
    message: z.string().describe("The message to be displayed to the speaker."),
    type: z.enum(["encouragement", "warning", "info"]).describe("The type of alert.")
});

export const GenerateAlertsOutputSchema = z.object({
  alerts: z.array(AlertSchema).describe('A list of scheduled alerts.'),
});
export type GenerateAlertsOutput = z.infer<typeof GenerateAlertsOutputSchema>;

export async function generateAlerts(
  input: GenerateAlertsInput
): Promise<GenerateAlertsOutput> {
  return generateAlertsFlow(input);
}

const generateAlertsPrompt = ai.definePrompt({
  name: 'generateAlertsPrompt',
  input: { schema: GenerateAlertsInputSchema },
  output: { schema: GenerateAlertsOutputSchema },
  prompt: `You are an expert event manager responsible for keeping speakers on time. 
  
  Your task is to generate a schedule of automated "smart alerts" for a presentation that will last for {{{durationInMinutes}}} minutes.
  
  Create a series of timed messages to help the speaker manage their time effectively. The schedule should include:
  - An encouraging message near the beginning.
  - A heads-up when they are about halfway through.
  - A 5-minute warning.
  - A 2-minute or 1-minute warning to wrap up.
  - A "Time's up" message at the end.
  - An overtime warning if appropriate for longer presentations.

  All 'time' values in the output must be in seconds from the start of the presentation. For a {{{durationInMinutes}}} minute presentation, the final "Time's up" alert should be at {{{durationInMinutes}}} * 60 seconds.
  
  Generate the schedule and provide it in the requested format.`,
});


const generateAlertsFlow = ai.defineFlow(
  {
    name: 'generateAlertsFlow',
    inputSchema: GenerateAlertsInputSchema,
    outputSchema: GenerateAlertsOutputSchema,
  },
  async (input) => {
    const { output } = await generateAlertsPrompt(input);
    return output!;
  }
);
