import { SummaryRenderer } from "./SummaryRenderer";
import { Summarize } from "@mui/icons-material";
import { AiAction } from "..";
import { mainPrompt } from "./mainPrompt";
import { chapterPrompt } from "./chaptersPrompt";

export const summaryAction: AiAction<SummaryResult> = {
    icon: Summarize,
    label: 'Summarize Video',
    rendeder: SummaryRenderer,
    mainPrompt,
    chapterPrompt
}

export type SummaryResult = {
    summary: string;
}