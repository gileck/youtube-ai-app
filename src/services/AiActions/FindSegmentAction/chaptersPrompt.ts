import { ChapterPromptFunction, FindSegmentActionParams } from "../types";

export const chapterPrompt: ChapterPromptFunction<FindSegmentActionParams> = ({
    chapterSegmants,
    params
}) => {
    const { chapterTitle, query } = params;

    return `
    Search the following transcript content from the chapter titled "${chapterTitle}" for segments that are most relevant to this query: "${query}".
    
    TRANSCRIPT CONTENT with start and end times:
    ${chapterSegmants?.map(seg => `
        start_time_text: ${seg.start_time_text}
        start_seconds: ${seg.start_seconds}
        end_seconds: ${seg.end_seconds}
        text: ${seg.text}
    `).join('\n')}
    
    Find TWO important timestamps:
    1. The start of the conversation about this topic - where the discussion of this subject begins 
       (this provides context to the viewer). 
       Do your best to find the start of the conversation about this topic - meaning the beginning of the first sentence of the conversation about this topic.
    
    2. The most directly relevant segment that specifically answers or addresses the query 
       (this jumps right to the key information)

    Return a JSON object with the following structure:
    {
      "conversation_start_seconds": (number) The start time in seconds where the broader conversation about this topic begins,
      "relevant_segment_seconds": (number) The start time in seconds of the segment most directly relevant to the query
    }
    
    If multiple relevant conversations exist, choose the most comprehensive one.
    If no relevant segments are found, return null.
    `;
};