import { AccessTime } from "@mui/icons-material";
import { AiActionSingleChapter, FindSegmentActionParams, SegmentResult } from "../types";
import { FindSegmentRenderer } from "./FindSegmentRenderer";
import { chapterPrompt } from "./chaptersPrompt";

export const findSegmentAction: AiActionSingleChapter<SegmentResult, FindSegmentActionParams> = {
    isMainAction: false,
    icon: AccessTime,
    label: 'Find Segment',
    renderer: FindSegmentRenderer,
    chapterPrompt,
    mainPrompt: false,
    singleChapter: true
}; 