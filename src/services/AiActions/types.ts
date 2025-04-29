/**
 * Types for AI Video Actions API
 */

import { YouTubeVideoDetails } from "@/shared/types/youtube";
import { Summarize } from "@mui/icons-material";
import { ChapterWithContent } from "@/server/youtube/types";

export type ChaptersData = Array<{
    title: string;
    result: string
}>;
export interface ActionRendererProps<T> {
    result: T;
    videoId: string;
    playerApi?: {
        seekTo: (seconds: number) => void;
        play: () => void;
        pause: () => void;
        getCurrentTime: () => number | undefined;
    };
}

export type ChapterPromptFunction<ActionParams> = ({
    videoDetails,
    chapters,
    content,
    params,
    chapterSegmants
}: {
    videoDetails: YouTubeVideoDetails | null;
    chapters: Array<ChapterWithContent>;
    content: string;
    params: ActionParams
    chapterSegmants?: ChapterWithContent['segments']
}) => string;
export type VideoActionType = 'summary' | 'keyPoints' | 'podcastQA' | 'questionDeepDive' | 'protocolDeepDive' | 'recommendations' | 'findSegment' | 'custom'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AiAction<T = any, ActionParams = any> = AiActionBase & {
    renderer: React.FC<ActionRendererProps<T>>;
    mainPrompt: ({
        videoDetails,
        chapters,
        params
    }: {
        videoDetails: YouTubeVideoDetails | null
        chapters: ChaptersData;
        params: ActionParams
    }) => string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chapterPrompt: ChapterPromptFunction<any>
    singleChapter: false
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AiActionChaptersOnly<T = any> = AiActionBase & {
    renderer: React.FC<ActionRendererProps<ChaptersAiActionResult<T>>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chapterPrompt: ChapterPromptFunction<any>
    mainPrompt: false
    singleChapter: false
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AiActionSingleChapter<T = any, ActionParams = any> = AiActionBase & {
    renderer: React.FC<ActionRendererProps<T>>;
    chapterPrompt: ChapterPromptFunction<ActionParams>
    mainPrompt: false
    singleChapter: true
}

export type AiActionBase = {
    isMainAction: boolean,
    icon: typeof Summarize,
    label: string,
}
export type AiActionsData = {
    [key in VideoActionType]: AiAction | AiActionChaptersOnly | AiActionSingleChapter
};

export type ChaptersAiActionResult<T> = {
    chapters: Array<{ title: string, result: T | null }>
}

export interface FindSegmentActionParams {
    chapterTitle: string;
    query: string;
}

export interface SegmentResult {
    conversation_start_seconds: number;
    relevant_segment_seconds: number;
}

// Add response type options for Custom AI action
export type CustomResponseType = 'list' | 'text';

// Add action type options for Custom AI action
export type CustomActionType = 'chapters' | 'combined' | 'singleChapter';

// Custom AI action params
export type CustomAiActionParams = {
    query: string;
    responseType: CustomResponseType;
    actionType: CustomActionType;
    chapterTitle?: string; // Required for singleChapter mode
}