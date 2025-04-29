import { ChapterPromptFunction, CustomAiActionParams } from "../types";
import { ChapterWithContent } from "@/server/youtube/types";
import { YouTubeVideoDetails } from "@/shared/types/youtube";

export const chapterPrompt: ChapterPromptFunction<CustomAiActionParams> = ({
  videoDetails,
  chapters,
  content,
  params
}) => {
  const { query, responseType } = params || { query: "", responseType: "text" };

  const videoTitle = videoDetails?.title || 'Untitled Video';

  let promptText = `You are an AI assistant analyzing YouTube video content.
  
VIDEO TITLE: ${videoTitle}

CONTENT:
${content}

USER Question about the content: ${query}

Requirements:
- Only provide information from the content.
- DO NOT provide any information that is not specifically mentioned in the provided content.
- Only provide information if the content answer the question or the request of the user query.
- If the content does not answer the question or the request of the user query, return empty array.
- Verify that your answer really answer the question or the request of the user query from the provided content.
- If the query is a question, the answer should be a single sentence (in the tile).
- Its very important that every item in the list will be an answer to the question or the request of the user query.
`;

  if (responseType === 'list') {
    promptText += `
    
    Respond with a JSON array of objects representing the answer to the question or the request of the user query across this chapter.
    
    The result should be a type of Array<Item>
    
    each Item is an answer to the question, and should include: 
    
    "title": string - the short answer - if the query is a question, the title should be the answer to the question (or one of the answers). if the query is a request for information, the title should be the information requested.
    "description": string - the longer answer of the item. This will include explanation, context, examples, protocols, etc. use markdown format with headings, bullet points, bold, italic, etc.
    "emoji": string - the emoji of the item.
    "chapterTitle": string - the title of the chapter that the item belongs to or the most relevant chapter.

    Example format: [{"title": "short title", "description": "longer Description 1...", "emoji": "🔍", "chapterTitle": "Chapter 1"}, {"title": "Point 2", "description": "Description 2", "emoji": "🔥", "chapterTitle": "Chapter 2"}]

`;
  } else {
    promptText += `Respond with a concise and informative text that answers the query based solely on the content of this chapter.`;
  }

  return promptText;
}; 