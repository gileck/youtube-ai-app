import { AiAction } from "..";

export const chapterPrompt: AiAction['chapterPrompt'] = ({ videoDetails, content }) => {
    return `
    Summarize the chapters of the video "${videoDetails?.title}".
    Chapters Content: 
    ${content}
    `
}