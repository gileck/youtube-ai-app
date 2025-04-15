import { AiAction } from "..";

export const chapterPrompt: AiAction['chapterPrompt'] = ({ videoDetails, chapter }) => {
    return `
    Summarize the chapter "${chapter.title}" from the video "${videoDetails?.title}".
    Chapter Content: ${chapter.content}
    `
}