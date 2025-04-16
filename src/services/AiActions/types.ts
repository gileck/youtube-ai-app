import { YouTubeVideoDetails } from "@/shared/types/youtube";
import { Summarize } from "@mui/icons-material";
import { ChapterWithContent } from "@/server/youtube/types";

export type ChaptersData = Array<{
    title: string;
    result: string
}>;
export interface ActionRendererProps {
    result: string;
  }
export type VideoActionType = 'summary'
export type AiAction = {
    icon: typeof Summarize,
    label: string,
    rendeder: React.FC<ActionRendererProps>;
    mainPrompt: ({
        videoDetails,
        chapters,
    }: {
        videoDetails: YouTubeVideoDetails | null
        chapters: ChaptersData;
    }) => string;
    chapterPrompt: ({ videoDetails, chapter }: { videoDetails: YouTubeVideoDetails | null; chapter: ChapterWithContent }) => string;
};
export type AiActionsData = {
    [key in VideoActionType]: AiAction
};
