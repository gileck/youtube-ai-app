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
 * @param params Request params
 * @returns Promise with all AI usage data
 */
export const getAllAIUsage = (
  params: GetAllAIUsageRequest
): Promise<CacheResult<GetAllAIUsageResponse>> => {
  return apiClient.call<GetAllAIUsageResponse, GetAllAIUsageRequest>(
    all,
    params
  );
};

/**
 * Get AI usage summary
 * @param params Request params
 * @returns Promise with AI usage summary data
 */
export const getAIUsageSummary = (
  params: GetAIUsageSummaryRequest
): Promise<CacheResult<GetAIUsageSummaryResponse>> => {
  return apiClient.call<GetAIUsageSummaryResponse, GetAIUsageSummaryRequest>(
    summary,
    params
  );
};
