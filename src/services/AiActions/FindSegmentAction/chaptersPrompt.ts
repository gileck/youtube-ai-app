import { ChapterPromptFunction, FindSegmentActionParams } from "../types";

export const chapterPrompt: ChapterPromptFunction<FindSegmentActionParams> = ({
    chapterSegmants,
    params
}) => {
    const { chapterTitle, query } = params;
    const isQuestion = query.trim().endsWith('?');

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

    ${isQuestion ? `
    Since the query is a question, you need to find the EXACT point where the answer to this specific question begins.
    Focus on these points when finding the relevant segment:
    - Look for where the specific answer to this question starts being given
    - If the exact question is asked in the transcript, find where the answer begins right after the question
    - The relevant segment should be the starting point of the answer, not the question itself
    - Make sure to find the specific answer to this particular question, not just general discussion about the topic
    - Pay attention to direct responses to the question, often indicated by phrases like "the answer is", "to answer that", etc.
    - Look for segments where the speaker directly addresses the specific concept mentioned in the question
    - If multiple answers exist, choose the most complete and direct answer
    - Prefer segments where the speaker gives a clear, concise explanation rather than tangential mentions
    ` : `
    If the query is a topic or statement, find the segment where:
    - The topic is introduced or explained in detail
    - The concept is defined or elaborated upon
    - Examples or applications of the topic are discussed
    - The most comprehensive discussion of the topic occurs
    `}

    Return a JSON object with the following structure:
    {
      "conversation_start_seconds": (number) The start time in seconds where the broader conversation about this topic begins,
      "relevant_segment_seconds": (number) The start time in seconds of the segment most directly relevant to the query
    }
    
    If multiple relevant conversations exist, choose the most comprehensive one.
    If no relevant segments are found, return null.
    `;
};