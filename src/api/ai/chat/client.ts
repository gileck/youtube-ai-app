import { ChatRequest, ChatResponse } from "./types";
import apiClient from "../../../clientUtils/apiClient";

/**
 * Client-side function to call the chat API
 * @param request The chat request parameters
 * @returns Promise with the chat response
 */
export const chatWithAI = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    return await apiClient.post<ChatResponse, ChatRequest>(
      '/api/ai/chat',
      request
    );
  } catch (error) {
    console.error('Error calling chat API:', error);
    return {
      result: '',
      cost: { totalCost: 0 },
      error: `Failed to call chat API: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};
