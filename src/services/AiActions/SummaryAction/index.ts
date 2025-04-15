import { SummaryRenderer } from "@/client/components/AiActions/aiActionsRenderers";
import { Summarize } from "@mui/icons-material";
import { AiAction } from "..";
import { mainPrompt } from "./mainPrompt";
import { chapterPrompt } from "./chaptersPrompt";

export const summaryAction: AiAction = {
    icon: Summarize,
    label: 'Summarize Video',
    rendeder: SummaryRenderer,
    mainPrompt,
    chapterPrompt
}