'use server';
/**
 * @fileOverview A flow for converting dates between Gregorian (AD) and Nepali (BS) calendars.
 *
 * - convertDate - A function that handles the date conversion.
 * - DateConversionInput - The input type for the convertDate function.
 * - DateConversionOutput - The return type for the convertDate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const DateConversionInputSchema = z.object({
  source: z.enum(['ad_to_bs', 'bs_to_ad']),
  year: z.number(),
  month: z.number(),
  day: z.number(),
});
export type DateConversionInput = z.infer<typeof DateConversionInputSchema>;

export const DateConversionOutputSchema = z.object({
  year: z.number(),
  month: z.string(),
  day: z.number(),
  fullDate: z.string().describe("The full converted date in 'Month Day, Year' format."),
});
export type DateConversionOutput = z.infer<typeof DateConversionOutputSchema>;

export async function convertDate(
  input: DateConversionInput
): Promise<DateConversionOutput> {
  return dateConversionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dateConversionPrompt',
  input: {schema: DateConversionInputSchema},
  output: {schema: DateConversionOutputSchema},
  prompt: `You are a date conversion expert. Convert the following date.

  Source Format: {{source}}
  Year: {{year}}
  Month: {{month}}
  Day: {{day}}
  
  Provide the converted date in the specified output format. For Nepali months, use the full name (e.g., 'Baisakh', 'Jestha').`,
});

const dateConversionFlow = ai.defineFlow(
  {
    name: 'dateConversionFlow',
    inputSchema: DateConversionInputSchema,
    outputSchema: DateConversionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
