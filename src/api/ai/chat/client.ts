import { ChatRequest, ChatResponse } from "./types";

/**
 * Client-side function to call the chat API
 * @param request The chat request parameters
 * @returns Promise with the chat response
 */
export const chatWithAI = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data as ChatResponse;
  } catch (error) {
    console.error('Error calling chat API:', error);
    return {
      result: '',
      cost: { totalCost: 0 },
      error: `Failed to call chat API: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};
