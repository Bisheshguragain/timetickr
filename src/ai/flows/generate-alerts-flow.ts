
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

const GenerateAlertsInputSchema = z.object({
  durationInMinutes: z
    .number()
    .positive()
    .describe('The total duration of the presentation in minutes.'),
  numberOfSpeakers: z
    .number()
    .positive()
    .int()
    .describe('The total number of speakers in the presentation session.'),
});
export type GenerateAlertsInput = z.infer<typeof GenerateAlertsInputSchema>;

const AlertSchema = z.object({
    time: z.number().describe("The time in seconds from the start of the presentation when the alert should be sent."),
    message: z.string().describe("The message to be displayed to the speaker or event manager."),
    type: z.enum(["encouragement", "warning", "info"]).describe("The type of alert.")
});

const GenerateAlertsOutputSchema = z.object({
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
  prompt: `You are an expert event manager responsible for creating and optimizing presentation schedules. 

  Your task is to generate a schedule of automated "smart alerts" for a session that is {{{durationInMinutes}}} minutes long and has {{{numberOfSpeakers}}} speakers.

  First, calculate the time allocated to each speaker. If there are multiple speakers, assume a small buffer between them for introductions and handoffs.
  
  Then, create a series of timed messages for the entire session to keep things running smoothly. This schedule should include:
  - An info message to start the session.
  - For each speaker:
    - An info message announcing the start of their slot (e.g., "Time for Speaker 2").
    - An encouraging message near the beginning of their time.
    - A warning when they have 2 minutes remaining.
    - A final "Time's up" message for their slot.
  - A 5-minute warning before the entire session ends.
  - A final "Session Over" message at the very end.

  All 'time' values in the output must be in seconds from the start of the session. For a {{{durationInMinutes}}} minute session, the final "Session Over" alert should be at {{{durationInMinutes}}} * 60 seconds.
  
  Generate the full, optimized schedule and provide it in the requested format.`,
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
