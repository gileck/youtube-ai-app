import { QuestionAnswer } from "@mui/icons-material";
import { AiActionSingleChapter } from "..";
import { chapterPrompt } from "./chaptersPrompt";
import QuestionDeepDiveRenderer from "./QuestionDeepDiveRenderer";

/**
 * "shortAnswer": "A concise answer to the question in a Fully contextualized open-ended answer",
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
 */
export type SingleAnswerResult = {
  shortAnswer: string,
  question: string,
  detailedPoints: string[],
  quotes: string[],
  additionalContext: string
}

export type QuestionDeepDiveParams = {
  question: string,
  chapterTitle: string
}

export const questionDeepDiveAction: AiActionSingleChapter<SingleAnswerResult, QuestionDeepDiveParams> = {
  isMainAction: false,
  icon: QuestionAnswer,
  label: 'Question Deep Dive',
  renderer: QuestionDeepDiveRenderer,
  mainPrompt: false,
  chapterPrompt,
  singleChapter: true
};
