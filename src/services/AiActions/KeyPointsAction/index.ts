import { FormatListBulleted } from "@mui/icons-material";
import { AiAction } from "..";
import { KeyPointsRenderer } from "./KeyPointsRenderer";
import { mainPrompt } from "./mainPrompt";
import { chapterPrompt } from "./chaptersPrompt";

export type KeyPoint = {
  title: string;
  emoji: string;
  description: string;
};

export type KeyPointsResult = {
  keyPoints: KeyPoint[];
};

export const keyPointsAction: AiAction<KeyPointsResult> = {
  icon: FormatListBulleted,
  label: 'Key Points',
  rendeder: KeyPointsRenderer,
  mainPrompt,
  chapterPrompt,
  singleChapter: false
};
