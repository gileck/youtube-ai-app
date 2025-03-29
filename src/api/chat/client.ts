import { ChatRequest, ChatResponse } from "./types";
import apiClient from "../../clientUtils/apiClient";
import { name } from "./index";
import type { CacheResult } from "@/serverUtils/cache/types";
/**
 * Client-side function to call the chat API
 * @param request The chat request parameters
 * @returns Promise with the chat response
 */
export const chatWithAI = async (request: ChatRequest): Promise<CacheResult<ChatResponse>> => {
    return apiClient.call<CacheResult<ChatResponse>, ChatRequest>(
      name,
      request
    )
};
