import { QuestionAnswer } from "@mui/icons-material";
import { AiActionChaptersOnly } from "..";
import PodcastQARenderer from "./PodcastQARenderer";
import { chapterPrompt } from "./chaptersPrompt";

export type QAPair = {
  question: string;
  answer: string;
};

export type PodcastQAResult = {
  subjects: Array<{
    subject: string;
    emoji: string;
    qaPairs: QAPair[];
  }>;
};

export const podcastQAAction: AiActionChaptersOnly<PodcastQAResult> = {
  isMainAction: true,
  icon: QuestionAnswer,
  label: 'Podcast Q&A',
  renderer: PodcastQARenderer,
  mainPrompt: false,
  chapterPrompt,
  singleChapter: false
};
