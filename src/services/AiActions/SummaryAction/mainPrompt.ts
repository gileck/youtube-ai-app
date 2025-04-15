import { AiAction } from "..";

export const mainPrompt: AiAction['mainPrompt'] = ({
    videoDetails,
    chapters,
}) => {

    const chapterSummaries = chapters.map(chapter => `Chapter: ${chapter.title} - Summary: ${chapter.result}`).join('\n');

    
    return `

    Video Title: ${videoDetails?.title}
    
    Create a detailed summary of the video based on these chapter summaries:
    
    
    ${chapterSummaries}
    
    .\n\n
    
    `;
}