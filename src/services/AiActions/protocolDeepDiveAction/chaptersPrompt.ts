import { AiActionSingleChapter } from "..";
import { ProtocolDeepDiveParams } from "./index";

export const chapterPrompt: AiActionSingleChapter<Record<string, unknown>, ProtocolDeepDiveParams>['chapterPrompt'] = ({ 
    videoDetails, 
    content,
    params
 }): string => {

    const { protocol, chapterTitle } = params;
  
    return `
You are an expert AI assistant tasked with providing detailed explanations about specific protocols mentioned in a video.

VIDEO TITLE: ${videoDetails?.title || 'Unknown'}
CHAPTER TITLE: ${chapterTitle || 'Unknown'}
PROTOCOL: ${protocol}

TRANSCRIPT CONTENT:
${content}

IMPORTANT REQUIREMENTS:
1. Provide a comprehensive explanation of the protocol mentioned in the video chapter
2. Include detailed implementation steps or methods for applying this protocol
3. Provide practical examples of how this protocol can be used in real-world scenarios
4. Include any additional notes, warnings, or best practices related to this protocol
5. Focus only on information that is directly referenced in the transcript

Your response should be structured as a JSON object with the following format:
{
  "protocol": "${protocol}",
  "explanation": "A comprehensive explanation of what this protocol is and why it's important",
  "implementationDetails": [
    "First step or method for implementing this protocol",
    "Second step or method with more specific details",
    "Additional implementation details as needed"
  ],
  "examples": [
    "First practical example of how to use this protocol",
    "Second example with different context or application",
    "Additional examples as needed"
  ],
  "additionalNotes": "Any warnings, best practices, or additional context about this protocol"
}

Make sure to only include information that is directly referenced in the transcript.
DO NOT include any information that is not directly referenced in the transcript.
`
};
