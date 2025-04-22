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
  }

  export type ChapterPromptFunction<ActionParams> = ({
    videoDetails,
    chapters,
    content,
    params
  }: {
    videoDetails: YouTubeVideoDetails | null;
    chapters: Array<ChapterWithContent>;
    content: string;
    params: ActionParams
  }) => string;
export type VideoActionType = 'summary' | 'keyPoints' | 'podcastQA' | 'questionDeepDive' | 'protocolDeepDive'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AiAction<T = any> = {
    icon: typeof Summarize,
    label: string,
    rendeder: React.FC<ActionRendererProps<T>>;
    mainPrompt: ({
        videoDetails,
        chapters,
    }: {
        videoDetails: YouTubeVideoDetails | null
        chapters: ChaptersData;
    }) => string ;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    chapterPrompt: ChapterPromptFunction<any>
    singleChapter: false
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AiActionChaptersOnly<T = any> = {
    icon: typeof Summarize,
    label: string,
    rendeder: React.FC<ActionRendererProps<ChaptersAiActionResult<T>>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    chapterPrompt: ChapterPromptFunction<any>
    mainPrompt: false
    singleChapter: false
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AiActionSingleChapter<T = any, ActionParams = any> = {
    icon: typeof Summarize,
    label: string,
    rendeder: React.FC<ActionRendererProps<T>>;
    chapterPrompt: ChapterPromptFunction<ActionParams>
    mainPrompt: false
    singleChapter: true
}
export type AiActionsData = {
    [key in VideoActionType]: AiAction | AiActionChaptersOnly | AiActionSingleChapter
};

export type ChaptersAiActionResult<T> = {
    chapters: Array<{title: string, result: T | null}>
}