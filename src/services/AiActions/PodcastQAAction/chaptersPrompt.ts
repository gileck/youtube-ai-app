import { AiAction } from "..";

export const chapterPrompt: AiAction['chapterPrompt'] = ({ videoDetails, chapter }) => {
    return `
    You are analyzing a podcast transcript to identify questions and answers.
    
    Chapter title: "${chapter.title}" from the video "${videoDetails?.title}"
    
    Chapter Content: ${chapter.content}
    
    Identify all questions asked by the interviewer and the corresponding answers from the guest in this chapter.
    For each question, create a simplified, concise version that captures the essence of what was asked.
    For each answer, create a concise summary that captures the key points of the guest's response.
    
    Format the questions as if you are asking the question directly (e.g., "How did you...?").
    Format the answers as if the guest is answering directly (e.g., "I started in...").
    Do not use phrases like "The speaker" or "The guest" in the answer.
    
    If appropriate, combine 2 related questions into one question and answer pair, but only if it makes sense to combine them.
    
    Make sure to only include information that is directly referenced in the transcript.
    DO NOT include any information that is not directly referenced in the transcript.
    
    Return the results as a simple list of question-answer pairs.
    `;
};
