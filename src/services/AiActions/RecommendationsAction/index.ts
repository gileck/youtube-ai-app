import { Recommend } from "@mui/icons-material";
import { AiActionChaptersOnly } from "../types";
import { RecommendationsRenderer } from "./RecommendationsRenderer";
import { chapterPrompt } from "./chaptersPrompt";

export type RecommendationItem = {
    title: string;
    emoji: string;
    shortDescription: string;
    detailedDescription: string[];
    chapterTitle: string;
};

export type RecommendationsResult = {
    recommendations: RecommendationItem[];
};

export const recommendationsAction: AiActionChaptersOnly<RecommendationsResult> = {
    isMainAction: true,
    icon: Recommend,
    label: 'Recommendations',
    renderer: RecommendationsRenderer,
    chapterPrompt,
    mainPrompt: false,
    singleChapter: false
}; 