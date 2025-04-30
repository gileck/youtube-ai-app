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

  return `You are an AI assistant analyzing YouTube video content.

  You are given a question or a request for information about the content of a chapter.
  You need to answer the question or provide the information requested from the content of the chapter.

VIDEO TITLE: ${videoTitle}


CONTENT:
${content}

USER Question about the content: ${query}

Requirements:
- Only provide information from the content.
- DO NOT provide any information that is not specifically mentioned in the provided content.
- Only provide information if the content answer the question or the request of the user query.
- Verify that your answer really answer the question or the request of the user query from the provided content.
- If the query is a question, the answer should be a single sentence (in the tile).
- Its very important that every item in the list will be an answer to the question or the request of the user query.
- Respond with a list of answers to the question or the request of the user query.
- Each item in the list is one answer to the question or the request of the user query.
- If the content does not answer the question or the request of the user query, return empty array.
- The answer should be very specific to the question or the request of the user query.
- Dont answer with a general answer, the answer should be very specific to the question or the request of the user query.
- The answer should be specific.
- The answer should be a single sentence, not a title to the description.

    Respond with a JSON array of objects representing the answers to the question or the request of the user query across this chapter.
    
    The result should be a type of Array<Item> - the list of answers to the question or the request of the user query.
    
    each Item is an answer to the question, and should include: 
    
    "answer": string - the short answer - if the query is a question, the answer should be the answer to the question. The answer is a short sentence (a couple of words describing the answer).
    "description": string - the longer answer of the item. This will include explanation, context, examples, protocols, etc. use markdown format with headings, bullet points, bold, italic, etc.
    "emoji": string - the emoji of the item.
    "chapterTitle": string - the title of the chapter that the item belongs to or the most relevant chapter.
    "answerScore": number - from 1-10 how likely is the answer of the item answers the question or the request of the user query? (1 means probably not answering the question, 10 means the title for sure answers the question or the request of the user query).   

    Example:

    question: "What tools can I use to improve my productivity?"

    RESPONSE (answers): 
    
    [
        {
            "answer": "Use Notion",
            "description": "Notion is a productivity tool that can help you improve your productivity...",
            "emoji": "🔍",
            "chapterTitle": "Chapter 1",
            "answerScore": 10
        },
        {
            "answer": "Do 10 pushups",
            "description": "Pushups are a great way to improve your productivity...",
            "emoji": "🔍",
            "chapterTitle": "Chapter 2",
            "answerScore": 5
        }
]

MAKE SURE THE items (especially the answer) really answer the question or the request of the user query.
If the content specifically answers the question or the request of the user query, return [].



`
}; 