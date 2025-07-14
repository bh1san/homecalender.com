'use server';
/**
 * @fileOverview A flow for converting dates between Gregorian (AD) and Nepali (BS) calendars.
 *
 * - convertDate - A function that handles the date conversion.
 */

import {ai} from '@/ai/genkit';
import {
  DateConversionInput,
  DateConversionInputSchema,
  DateConversionOutput,
  DateConversionOutputSchema,
} from '@/ai/schemas';

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
