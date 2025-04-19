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
  icon: FormatListBulleted,
  label: 'Key Points',
  rendeder: KeyPointsRenderer,
  chapterPrompt,
  mainPrompt: false,
  singleChapter: false
};
