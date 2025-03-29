import { 
  generateCacheKey, 
  readCache, 
  writeCache, 
  deleteCache, 
  clearAllCache as clearAll, 
  getCacheStatus as getStatus 
} from './fsCache';
import { CacheOptions, CacheParams, CacheResult, CacheStatus } from './types';

/**
 * Default cache options
 */
const DEFAULT_OPTIONS: CacheOptions = {
  ttl: 60 * 60 * 1000, // 1 hour in milliseconds
  bypassCache: false,
};

/**
 * Executes a function with caching
 * @param callback The function to execute and cache
 * @param params Cache parameters for generating the cache key
 * @param options Cache options
 * @returns The result of the function execution and whether it came from cache
 */
export const withCache = async <T>(
  callback: () => Promise<T>,
  params: CacheParams,
  options?: CacheOptions
): Promise<CacheResult<T>> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const cacheKey = generateCacheKey(params);

  // If disable cache is set, skip cache lookup
  if (opts.disableCache) {
    const result = await callback();
    return { data: result, isFromCache: false };
  }
  
  // If bypass cache is set, skip cache lookup but save the result to cache
  if (opts.bypassCache) {
    const result = await callback();
    
    // Only cache successful results (no error property)
    if (!hasErrorProperty(result)) {
      const metadata = writeCache(cacheKey, result, opts.ttl || DEFAULT_OPTIONS.ttl!);
      return { data: result, isFromCache: false, metadata };
    }
    
    return { data: result, isFromCache: false };
  }
  
  // Try to get from cache first
  const cached = readCache<T>(cacheKey);
  
  if (cached) {
    return {
      data: cached.data,
      isFromCache: true,
      metadata: cached.metadata,
    };
  }
  
  // Execute the function and cache the result
  const result = await callback();
  
  // Only cache successful results (no error property)
  if (!hasErrorProperty(result)) {
    const metadata = writeCache(cacheKey, result, opts.ttl || DEFAULT_OPTIONS.ttl!);
    return {
      data: result,
      isFromCache: false,
      metadata,
    };
  }
  
  return {
    data: result,
    isFromCache: false,
  };
};

/**
 * Helper function to check if a result has an error property
 */
function hasErrorProperty(result: unknown): boolean {
  return (
    result !== null &&
    typeof result === 'object' &&
    'error' in result &&
    result.error !== undefined &&
    result.error !== null
  );
}

/**
 * Clears the cache for specific parameters
 * @param params Cache parameters for generating the cache key
 * @returns Whether the cache was successfully cleared
 */
export const clearCache = (params: CacheParams): boolean => {
  const cacheKey = generateCacheKey(params);
  return deleteCache(cacheKey);
};

/**
 * Gets the status of a cache entry
 * @param params Cache parameters for generating the cache key
 * @returns The status of the cache entry
 */
export const getCacheStatus = (params: CacheParams): CacheStatus => {
  return getStatus(params);
};

/**
 * Clears all cache entries
 * @returns Whether all cache entries were successfully cleared
 */
export const clearAllCache = (): boolean => {
  return clearAll();
};

export type { CacheOptions, CacheParams, CacheResult, CacheStatus } from './types';
