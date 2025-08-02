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
  
  Provide the converted date in the specified output format.
  - For ad_to_bs conversions, provide the Nepali month name and weekday in Nepali script (e.g., 'बैशाख', 'आइतवार').
  - For bs_to_ad conversions, use the full English name (e.g., 'Baisakh', 'Sunday').
  - The fullDate should always be in 'Month Day, Year' format using the appropriate language.`,
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
