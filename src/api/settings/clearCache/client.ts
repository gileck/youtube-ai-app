import { ClearCacheRequest, ClearCacheResponse } from './types';
import apiClient from '../../../clientUtils/apiClient';
import { name } from './index';
import type { CacheResult } from '@/serverUtils/cache/types';

/**
 * Client-side function to call the clear cache API
 * @returns Promise with the clear cache response
 */
export const clearCache = async (): Promise<CacheResult<ClearCacheResponse>> => {
  return apiClient.call<CacheResult<ClearCacheResponse>, ClearCacheRequest>(
    name,
    {},
    {
      disableCache: true
    }
  );
};
