import { AiAction } from "..";

export const mainPrompt: AiAction['mainPrompt'] = ({
    videoDetails,
    chapters,
}) => {

    const chapterSummaries = chapters.map(chapter => `Chapter: ${chapter.title} - Summary: ${chapter.result}`).join('\n');

    return `
    Video Title: ${videoDetails?.title}
    
    Extract the key points from the video based on the following chapter summaries:

    ${chapterSummaries}

    Return a JSON object with the following structure:
    
    {
        "keyPoints": [
            {
                "title": "Short, concise title of the key point",
                "emoji": "A single emoji that relates to the content of this key point",
                "description": "Detailed description of the key point"
            },
            ...
        ]
    }

    Guidelines:
    1. Each key point should have a clear, concise title (5-10 words)
    2. Include a relevant emoji for each key point that represents its content
    3. Provide a detailed description for each key point (2-4 sentences)
    4. Identify 5-8 key points from the video
    5. Use markdown formatting in the descriptions where appropriate
    6. Focus on the most important information from the video
    `;
}
