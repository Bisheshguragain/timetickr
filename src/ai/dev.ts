import { config } from 'dotenv';
config();

import '@/ai/flows/moderate-message.ts';
import '@/ai/flows/generate-alerts-flow.ts';
import '@/ai/flows/generate-speech-flow.ts';
import '@/ai/flows/generate-image-flow.ts';
import '@/ai/flows/generate-speech-audio-flow.ts';
