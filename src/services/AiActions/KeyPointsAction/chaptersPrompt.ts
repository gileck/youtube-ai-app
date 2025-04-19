import { AiAction } from "..";

export const chapterPrompt: AiAction['chapterPrompt'] = ({ videoDetails, content }) => {
    return `
    Extract the most important key point(s) from the chapters of the video "${videoDetails?.title}".

    each chapter beging with its title and then the chapter's content.

    Chapters Content: 
    
    ${content}

    Return a JSON object with the following structure:
    
    {
        "keyPoints": [
            {
                "title": (string) - Short, concise title of the key point,
                "emoji": (string) - A single emoji that relates to the content of this key point,
                "description": (string) - Detailed description of the key point with markdowns,
                "protocols": (Array<string>) - Array of protocols/recommendations of this key point mentioned in the chapter. include examples, implementation details, tools, protocols, recommendations, etc. be as detailed and specific as possible,
                "chapterTitle": (string) - The title of the specific chapter the key point is taken from (if there are multiple chapters, take the most relevant one).
            },
            ...
        ]
    }

    Guidelines:
    1. Each key point should have a clear, concise title (5-10 words).
    2. Include a relevant emoji for each key point that represents its content.
    3. Provide a detailed description for each key point.
    4. Identify the most important 1-2 key points from the chapters.
    5. Use markdown formatting in the descriptions where appropriate.
    6. Focus on the most important information from the chapters.
    7. Only include information that is directly mentioned in the chapters.
    8. Make sure that the chapterTitle is the title of the chapter the key point is taken from.
    `;
}
