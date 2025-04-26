import { FormatListBulleted } from "@mui/icons-material";
import { AiActionChaptersOnly } from "..";
import { KeyPointsRenderer } from "./KeyPointsRenderer";
import { chapterPrompt } from "./chaptersPrompt";

export type KeyPoint = {
  title: string;
  emoji: string;
  description: string;
  protocols: string[];
  chapterTitle: string
};

export type KeyPointsResult = {
  keyPoints: KeyPoint[];
};

export const keyPointsAction: AiActionChaptersOnly<KeyPointsResult> = {
  isMainAction: true,
  icon: FormatListBulleted,
  label: 'Key Points',
  renderer: KeyPointsRenderer,
  chapterPrompt,
  mainPrompt: false,
  singleChapter: false
};
