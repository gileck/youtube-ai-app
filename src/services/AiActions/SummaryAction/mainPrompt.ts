import { AiAction } from "..";

export const mainPrompt: AiAction['mainPrompt'] = ({
    videoDetails,
    chapters,
}) => {

    const chapterSummaries = chapters.map(chapter => `Chapter: ${chapter.title} - Summary: ${chapter.result}`).join('\n');

    
    return `

    Video Title: ${videoDetails?.title}
    
    Create a detailed summary of the video based on the following chapter summaries:

    ${chapterSummaries}

    Return a JSON object with the following structure:
    
    {
        "summary": "..."
    }

    The summary should be detailed and cover the main points of the video.
    The summary should not be splitted per chapter, rather splitted per key point of the video.
    Use markdown formatting for the summary.
    
    `;
}