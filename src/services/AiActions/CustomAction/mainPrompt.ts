import { YouTubeVideoDetails } from "@/shared/types/youtube";
import { ChaptersData, CustomAiActionParams } from "../types";

export const mainPrompt = ({ videoDetails, chapters, params }: { videoDetails: YouTubeVideoDetails | null, chapters: ChaptersData, params: CustomAiActionParams }) => {
  const videoTitle = videoDetails?.title || 'Untitled Video';
  const query = params.query;
  const responseType = params.responseType;

  let chaptersContent = '';
  
  chapters.forEach(chapter => {
    chaptersContent += `## ${chapter.title}:\n${chapter.result}\n\n`;
  });

  let promptText = `You are an AI assistant analyzing a YouTube video. You will be provided with chapter-specific analyses and you need to create a cohesive response.

VIDEO TITLE: ${videoTitle}

CHAPTER ANALYSES:
${chaptersContent}

USER QUERY: ${query}

`;

  if (responseType === 'list') {
    promptText += `
    Analyze the chapter responses and provide a cohesive conclusion. 
    Respond with a JSON array of strings representing the most important points that answer the query across all chapters.
    The result should be a type of Array<Item>
    
    each Item include: 
    "title": string - the short title of the item.
    "description": string - the longer description of the item.
    "emoji": string - the emoji of the item.
    "chapterTitle": string - the title of the chapter that the item belongs to or the most relevant chapter.

    Example format: [{"title": "short title", "description": "longer Description 1...", "emoji": "🔍", "chapterTitle": "Chapter 1"}, {"title": "Point 2", "description": "Description 2", "emoji": "🔥", "chapterTitle": "Chapter 2"}]
`;
  } else {
    promptText += `Analyze the chapter responses and provide a cohesive response that answers the user's query based on information from all chapters.`;
  }

  return promptText;

  
}; 