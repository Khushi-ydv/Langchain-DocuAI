'use server';

/**
 * @fileOverview Processes two documents using OpenAI to extract their content for similarity analysis.
 *
 * - processDocuments - Processes two documents and returns their content.
 * - ProcessDocumentsInput - The input type for the processDocuments function.
 * - ProcessDocumentsOutput - The return type for the processDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessDocumentsInputSchema = z.object({
  document1Content: z.string().describe('Content of the first document.'),
  document2Content: z.string().describe('Content of the second document.'),
});
export type ProcessDocumentsInput = z.infer<typeof ProcessDocumentsInputSchema>;

const ProcessDocumentsOutputSchema = z.object({
  document1ProcessedContent: z.string().describe('Processed content of the first document.'),
  document2ProcessedContent: z.string().describe('Processed content of the second document.'),
});
export type ProcessDocumentsOutput = z.infer<typeof ProcessDocumentsOutputSchema>;

export async function processDocuments(input: ProcessDocumentsInput): Promise<ProcessDocumentsOutput> {
  return processDocumentsFlow(input);
}

const processDocumentsPrompt = ai.definePrompt({
  name: 'processDocumentsPrompt',
  input: {schema: ProcessDocumentsInputSchema},
  output: {schema: ProcessDocumentsOutputSchema},
  prompt: `You are an expert document content extractor.

You will receive the contents of two documents. Extract the key concepts and meaning from each document.

Document 1 Content: {{{document1Content}}}

Document 2 Content: {{{document2Content}}}

Return the processed content for each document. Focus on extracting the meaning rather than summarizing.
`,
});

const processDocumentsFlow = ai.defineFlow(
  {
    name: 'processDocumentsFlow',
    inputSchema: ProcessDocumentsInputSchema,
    outputSchema: ProcessDocumentsOutputSchema,
  },
  async input => {
    const {output} = await processDocumentsPrompt(input);
    return output!;
  }
);
