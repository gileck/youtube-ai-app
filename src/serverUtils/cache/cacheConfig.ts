/**
 * Cache configuration settings
 */

export interface CacheConfig {
  /** The cache provider to use: 'fs' or 's3' */
  provider: 'fs' | 's3';
  /** Time-to-live in milliseconds for cache entries */
  ttl: number;
  /** S3 cache folder prefix */
  s3CachePrefix: string;
}

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Default cache configuration
 */
export const defaultCacheConfig: CacheConfig = {
  // Default to filesystem cache, can be overridden by environment variable
  provider: isProduction ? 's3' : 's3',
  // Default TTL: 1 hour in milliseconds
  ttl: parseInt(process.env.CACHE_TTL || '3600000', 10),
  // S3 cache folder prefix
  s3CachePrefix: process.env.S3_CACHE_PREFIX || 'cache/',
};

/**
 * Get the current cache configuration
 */
export const getCacheConfig = (): CacheConfig => {
  return defaultCacheConfig;
};
