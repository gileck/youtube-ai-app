import { AiAction } from "..";

export const mainPrompt: AiAction['mainPrompt'] = ({
    videoDetails,
    chapters,
}) => {
    const chapterResults = chapters.map(chapter => `Chapter: ${chapter.title}\n${chapter.result}`).join('\n\n');

    return `
    You are analyzing a podcast transcript to create a comprehensive list of questions and answers.
    
    Video Title: ${videoDetails?.title}
    
    Based on the following chapter analyses, create a final list of all questions and answers from the podcast:
    
    ${chapterResults}
    
    IMPORTANT REQUIREMENTS:
    1. Identify all questions asked by the interviewer and the corresponding answers from the guest
    2. For each question, create a simplified, concise version that captures the essence of what was asked
    3. For each answer, create a concise summary that captures the key points of the guest's response
    4. Format the questions as if you are asking the question directly (e.g., "How did you...?")
    5. Format the answers as if the guest is answering directly (e.g., "I started in...") 
    6. Do not use phrases like "The speaker" or "The guest" in the answer
    7. If appropriate, combine 2 related questions into one question and answer pair, but only if it makes sense to combine them
    8. Remove any duplicate questions and answers
    9. Organize the questions and answers in a logical flow that follows the conversation
    
    Make sure to only include information that is directly referenced in the transcript.
    DO NOT include any information that is not directly referenced in the transcript.
    
    Return a JSON object with the following structure:
    
    {
        "qaPairs": [
            {
                "question": "How did you first get started in this field?",
                "answer": "I began my journey in 2010 when I was working at a small startup..."
            },
            {
                "question": "What challenges did you face early on?",
                "answer": "The biggest challenge was securing funding while also..."
            }
        ]
    }
    
    Each answer should be a concise summary of the guest's response, formatted in markdown for readability.
`;
};
