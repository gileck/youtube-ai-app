import { QuestionAnswer } from "@mui/icons-material";
import { AiAction } from "..";
import PodcastQARenderer from "./PodcastQARenderer";
import { mainPrompt } from "./mainPrompt";
import { chapterPrompt } from "./chaptersPrompt";

export type QAPair = {
  question: string;
  answer: string;
};

export type PodcastQAResult = {
  qaPairs: QAPair[];
};

export const podcastQAAction: AiAction<PodcastQAResult> = {
  icon: QuestionAnswer,
  label: 'Podcast Q&A',
  rendeder: PodcastQARenderer,
  mainPrompt,
  chapterPrompt
};
