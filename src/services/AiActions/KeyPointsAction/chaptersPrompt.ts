import { AiAction } from "..";

export const chapterPrompt: AiAction['chapterPrompt'] = ({ videoDetails, chapter }) => {
    return `
    Extract the key points from the chapter "${chapter.title}" of the video "${videoDetails?.title}".
    Focus on the most important information, concepts, and insights.
    Chapter Content: ${chapter.content}
    `
}
