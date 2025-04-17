import { AiActionSingleChapter } from "..";
import { YouTubeVideoDetails } from "@/shared/types/youtube";
import { ChapterWithContent } from "@/server/youtube/types";
import { QuestionDeepDiveParams } from "./index";

export const chapterPrompt: AiActionSingleChapter<Record<string, unknown>, QuestionDeepDiveParams>['chapterPrompt'] = ({ 
    videoDetails, 
    chapter,
    params
 }: {
    videoDetails: YouTubeVideoDetails | null;
    chapter: ChapterWithContent | undefined;
    params: QuestionDeepDiveParams
 }): string => {

    const { question, chapterTitle } = params
    const questionStr = question as string;
  
    return `
You are an expert AI assistant tasked with providing detailed answers to questions about specific parts of a video.

VIDEO TITLE: ${videoDetails?.title || 'Unknown'}
CHAPTER TITLE: ${chapterTitle || 'Unknown'}

TRANSCRIPT CONTENT:
${chapter?.content || 'No transcript available'}

QUESTION: ${questionStr}

${chapter ? '' : 'WARNING: The specified chapter was not found. Please indicate this in your response.'}

IMPORTANT REQUIREMENTS:
1. Start with a concise one-sentence answer that directly addresses the question
2. Follow with all detailed bullet points that elaborate on the answer with specific information from the transcript with explanations, descriptions, examples, implementation details, and context.
3. Include 1-5 direct quotes from the transcript that best support your answer. only include relevant quotes to the answer.
4. Do not include duplicated quotes
5. Try to make each quote a complete sentence from the transcript
6. Quotes can include "..." in the middle to connect relevant parts
7. If needed, provide additional context about the question that might help understand it better

Your response should be structured as a JSON object with the following format:
{
  "shortAnswer": "A concise answer to the question in a Fully contextualized open-ended answer",
  "question": "The question in a Fully contextualized open-ended question, with context.",
  "detailedPoints": [
    "First detailed point explaining an aspect of the answer",
    "Second detailed point with more information",
    "Additional points as needed"
  ],
  "quotes": [
    "Direct quote from the transcript supporting the answer",
    "Another supporting quote if available",
    "Additional quotes as needed"
  ],
  "additionalContext": "Optional additional context about the question if needed"
}

Make sure to only include information that is directly referenced in the transcript.
DO NOT include any information that is not directly referenced in the transcript.


`
};
