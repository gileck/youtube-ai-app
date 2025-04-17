import { AiAction } from "..";

export const chapterPrompt: AiAction['chapterPrompt'] = ({ videoDetails, chapter }) => {
    return `
    You are analyzing a podcast transcript to identify questions and answers.

    The video is a podcast interview between an interviewer and a guest or a solo podcast (a podcast where the speaker is the guest).

    The speaker name is usually in the video title: "${videoDetails?.title}".
    The interviewer name is usually in the channel name which is "${videoDetails?.channelTitle}"
    
    Chapter title: "${chapter.title}" from the video "${videoDetails?.title}"
    
    Chapter Content: ${chapter.content}
    
    Identify all questions asked by the interviewer and the corresponding answers from the guest in this chapter.
    For each question, create a simplified, concise version that captures the essence of what was asked.
    For each answer, create a concise summary that captures the key points of the guest's response.
    
    Format the questions as if you are asking the question directly (e.g., "How did you...?").
    Format the answers as if the guest is answering directly (e.g., "I started in...").
    DO NOT use phrases like "The speaker" or "The guest" in the question or answer. instead DO Format the questions and answers as if you are asking/answering the question/answer directly (e.g., "How did you...?", "I started in...").
    for example: BAD - "The speaker suggests that...". GOOD - "I suggest that..."

    Format the question in as a full structured sentence, without words like "This" or "That" (without giving appropriate context).
    for example: BAD - "How is this impacting our health?" GOOD - "How is the [subject] impacting our health?"
    
    If appropriate, combine 2 related questions into one question and answer pair, but only if it makes sense to combine them.
    
    Make sure to only include information that is directly referenced in the transcript.
    DO NOT include any information that is not directly referenced in the transcript.

    Group the questions and answers by subject.
    Use the chapter title (if exists) as ideas for the subjects used.

    The result should be array of subjects (could be one subject or more), each with a list of questions and answers.

    Return the results as a JSON object with the following structure:
    
    {
        "subjects": [
            {
                "subject": "[ the main subject of the questions/answers in a few words ]",
                "emoji": "[ an emoji that represents the subject ]",
                "qaPairs": [
                    {
                        "question": "...",
                        "answer": "..."
                    },
                    ...
                ]
            },
            ...
        ]
    }
    `;
};
