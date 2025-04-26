import { AiAction } from "..";

export const chapterPrompt: AiAction['chapterPrompt'] = ({ videoDetails, content }) => {
    return `
    Extract all recommendations, specific examples, protocols, and tools from the podcast chapters.
    
    The podcast title is: "${videoDetails?.title}"
    
    Chapters Content: 
    
    ${content}

    Return a JSON object with the following structure:
    
    {
        "recommendations": [
            {
                "title": (string) - Clear, concise title of the recommendation, example, protocol, or tool,
                "emoji": (string) - A single emoji that represents this recommendation or tool,
                "shortDescription": (string) - Brief summary of what this recommendation is about (visible by default),
                "detailedDescription": (Array<string>) - List of bullet points with detailed information about implementation, usage, benefits, etc.,
                "chapterTitle": (string) - The title of the chapter where this recommendation appears
            },
            ...
        ]
    }

    Guidelines:
    1. Be comprehensive - extract ALL specific recommendations, Action items, tools and protocols mentioned. Specificity is key. All recommendations should be actionable.
    2. Each item should have a clear, concise title (3-7 words)
    3. Include a relevant emoji for each item
    4. Write a short description (1-2 sentences) that summarizes what the recommendation is
    5. For detailed description, create a list of bullet points with specific implementation details
    6. Be specific and detailed - include exact steps, tools, techniques mentioned
    7. Each recommendation should come from information explicitly mentioned in the podcast
    8. Use the exact chapter title where the recommendation appears in chapterTitle field
    `;
} 