/**
 * Client-side implementation for AI Video Actions API
 */

import apiClient from '../../client/utils/apiClient';
import { CacheResult } from '../../server/cache/types';
import { AIVideoActionRequest, AIVideoActionResponse } from './types';
import { name } from './index';
import { ApiOptions } from '../../client/utils/apiClient';

/**
 * Process an AI video action
 * @param request The AI video action request
 * @param options Cache options for the API call
 * @returns Promise with the action result or error
 */
export const processAIVideoAction = async (
  request: AIVideoActionRequest,
  options?: ApiOptions
): Promise<CacheResult<AIVideoActionResponse>> => {
  return apiClient.call<CacheResult<AIVideoActionResponse>, AIVideoActionRequest>(
    name,
    request,
    options
  );
};
