/**
 * Client implementation for the AI usage monitoring API
 */

import {
  GetAllAIUsageRequest,
  GetAllAIUsageResponse,
  GetAIUsageSummaryRequest,
  GetAIUsageSummaryResponse
} from './types';
import apiClient from '@/client/utils/apiClient';
// Import API names from index.ts
import { all, summary } from "./index";
import type { CacheResult } from '@/server/cache/types';

/**
 * Get all AI usage records
 */
export const getAllUsage = async (
  request: GetAllAIUsageRequest = {}
): Promise<CacheResult<GetAllAIUsageResponse>> => {
  return apiClient.call<CacheResult<GetAllAIUsageResponse>, GetAllAIUsageRequest>(
    all,
    request,
    {
      disableCache: true
    }
  );
};

/**
 * Get AI usage summary
 */
export const getSummary = async (): Promise<CacheResult<GetAIUsageSummaryResponse>> => {
  return apiClient.call<CacheResult<GetAIUsageSummaryResponse>, GetAIUsageSummaryRequest>(
    summary,
    {},
    {
      disableCache: true
    }
  );
};
