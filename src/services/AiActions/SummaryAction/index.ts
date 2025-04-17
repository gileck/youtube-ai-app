import { SummaryRenderer } from "./SummaryRenderer";
import { Summarize } from "@mui/icons-material";
import { AiAction } from "..";
import { mainPrompt } from "./mainPrompt";
import { chapterPrompt } from "./chaptersPrompt";

export const summaryAction: AiAction<SummaryResult> = {
    icon: Summarize,
    label: 'Summary',
    rendeder: SummaryRenderer,
    mainPrompt,
    chapterPrompt,
    singleChapter: false
}

export type SummaryResult = {
    summary: string;
}