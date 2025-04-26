import { RecommendationItem } from ".";
import { FormatRecommendation } from "./types";
import { v4 as uuidv4 } from 'uuid';

export const formatRecommendation = (
    recommendation: RecommendationItem,
    chapterTitle: string
): FormatRecommendation => {
    return {
        id: uuidv4(),
        title: recommendation.title,
        emoji: recommendation.emoji || "✨",
        shortDescription: recommendation.shortDescription,
        detailedDescription: Array.isArray(recommendation.detailedDescription)
            ? recommendation.detailedDescription
            : [recommendation.detailedDescription],
        chapterTitle,
    };
}; 