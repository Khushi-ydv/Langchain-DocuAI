'use server';

/**
 * @fileOverview Computes the similarity score between two documents using Langchain.
 *
 * - computeSimilarityScore - A function that computes the similarity score between two documents.
 * - ComputeSimilarityScoreInput - The input type for the computeSimilarityScore function.
 * - ComputeSimilarityScoreOutput - The return type for the computeSimilarityScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComputeSimilarityScoreInputSchema = z.object({
  document1: z.string().describe('The first document.'),
  document2: z.string().describe('The second document.'),
});
export type ComputeSimilarityScoreInput = z.infer<
  typeof ComputeSimilarityScoreInputSchema
>;

const ComputeSimilarityScoreOutputSchema = z.object({
  similarityScore: z
    .number()
    .describe('The similarity score between the two documents.'),
});
export type ComputeSimilarityScoreOutput = z.infer<
  typeof ComputeSimilarityScoreOutputSchema
>;

export async function computeSimilarityScore(
  input: ComputeSimilarityScoreInput
): Promise<ComputeSimilarityScoreOutput> {
  return computeSimilarityScoreFlow(input);
}

const computeSimilarityScorePrompt = ai.definePrompt({
  name: 'computeSimilarityScorePrompt',
  input: {schema: ComputeSimilarityScoreInputSchema},
  output: {schema: ComputeSimilarityScoreOutputSchema},
  prompt: `You are an AI expert in determining the similarity between two documents.

  Given the two documents below, compute a similarity score between 0 and 1, where 0 means not similar and 1 means very similar. Return the similarity score as a number.

  Document 1: {{{document1}}}
  Document 2: {{{document2}}}
  `,
});

const computeSimilarityScoreFlow = ai.defineFlow(
  {
    name: 'computeSimilarityScoreFlow',
    inputSchema: ComputeSimilarityScoreInputSchema,
    outputSchema: ComputeSimilarityScoreOutputSchema,
  },
  async input => {
    const {output} = await computeSimilarityScorePrompt(input);
    return output!;
  }
);
