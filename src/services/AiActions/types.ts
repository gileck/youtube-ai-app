import { YouTubeVideoDetails } from "@/shared/types/youtube";
import { Summarize } from "@mui/icons-material";
import { ChapterWithContent } from "@/server/youtube/types";

export type ChaptersData = Array<{
    title: string;
    result: string
}>;
export interface ActionRendererProps<T> {
    result: T;
  }
export type VideoActionType = 'summary' | 'keyPoints' | 'podcastQA'
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
    chapterPrompt: ({ videoDetails, chapter }: { videoDetails: YouTubeVideoDetails | null; chapter: ChapterWithContent }) => string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AiActionChaptersOnly<T = any> = {
    icon: typeof Summarize,
    label: string,
    rendeder: React.FC<ActionRendererProps<ChaptersAiActionResult<T>>>;
    chapterPrompt: ({ videoDetails, chapter }: { videoDetails: YouTubeVideoDetails | null; chapter: ChapterWithContent }) => string;
    mainPrompt: false
}
export type AiActionsData = {
    [key in VideoActionType]: AiAction | AiActionChaptersOnly
};

export type ChaptersAiActionResult<T> = Array<{title: string, result: T | null}>