import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { CacheMetadata } from './types';

// Constants
const CACHE_DIR = process.env.NODE_ENV === 'production' 
  ? '/tmp/app-cache' 
  : path.join(process.cwd(), '.cache');

/**
 * Ensures the cache directory exists
 */
const ensureCacheDir = (): void => {
  if (!fs.existsSync(CACHE_DIR)) {
    try {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create cache directory:', error);
    }
  }
};

/**
 * Generates a cache key from the provided parameters
 */
const generateCacheKey = (params: { key: string; params?: Record<string, unknown> }): string => {
  const { key, params: additionalParams } = params;
  
  // Create a stable representation of the parameters
  const paramsString = additionalParams 
    ? JSON.stringify(sortObjectKeys(additionalParams))
    : '';
  
  // Generate a hash of the key and parameters
  const hash = crypto
    .createHash('md5')
    .update(`${key}:${paramsString}`)
    .digest('hex');
  
  return hash;
};

/**
 * Sorts object keys recursively to ensure consistent serialization
 */
const sortObjectKeys = (obj: Record<string, unknown>): Record<string, unknown> => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys) as unknown as Record<string, unknown>;
  }
  
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = sortObjectKeys(obj[key] as Record<string, unknown>);
      return result;
    }, {} as Record<string, unknown>);
};

/**
 * Gets the path to a cache file
 */
const getCacheFilePath = (cacheKey: string): string => {
  return path.join(CACHE_DIR, `${cacheKey}.json`);
};

/**
 * Reads a cache entry
 */
const readCache = <T>(cacheKey: string): { data: T; metadata: CacheMetadata } | null => {
  const filePath = getCacheFilePath(cacheKey);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, metadata } = JSON.parse(fileContent);
    
    // Check if the cache has expired
    if (new Date(metadata.expiresAt) < new Date()) {
      return null;
    }
    
    return { data, metadata };
  } catch (error) {
    console.error('Failed to read cache:', error);
    return null;
  }
};

/**
 * Writes a cache entry
 */
const writeCache = <T>(cacheKey: string, data: T, ttl: number): CacheMetadata => {
  ensureCacheDir();
  const filePath = getCacheFilePath(cacheKey);
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttl);
  
  const metadata: CacheMetadata = {
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    key: cacheKey,
  };
  
  try {
    fs.writeFileSync(
      filePath,
      JSON.stringify({ data, metadata }, null, 2),
      'utf-8'
    );
    return metadata;
  } catch (error) {
    console.error('Failed to write cache:', error);
    throw new Error('Failed to write to cache');
  }
};

/**
 * Deletes a cache entry
 */
const deleteCache = (cacheKey: string): boolean => {
  const filePath = getCacheFilePath(cacheKey);
  
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
  try {
    fs.unlinkSync(filePath);
    return true;
  } catch (error) {
    console.error('Failed to delete cache:', error);
    return false;
  }
};

/**
 * Clears all cache entries
 */
const clearAllCache = (): boolean => {
  ensureCacheDir();
  
  try {
    const files = fs.readdirSync(CACHE_DIR);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to clear all cache:', error);
    return false;
  }
};

/**
 * Gets the status of a cache entry
 */
const getCacheStatus = (params: { key: string; params?: Record<string, unknown> }): { 
  exists: boolean; 
  metadata?: CacheMetadata; 
  isExpired?: boolean; 
} => {
  const cacheKey = generateCacheKey(params);
  const filePath = getCacheFilePath(cacheKey);
  
  if (!fs.existsSync(filePath)) {
    return { exists: false };
  }
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { metadata } = JSON.parse(fileContent);
    const isExpired = new Date(metadata.expiresAt) < new Date();
    
    return {
      exists: true,
      metadata,
      isExpired,
    };
  } catch (error) {
    console.error('Failed to get cache status:', error);
    return { exists: false };
  }
};

export {
  generateCacheKey,
  readCache,
  writeCache,
  deleteCache,
  clearAllCache,
  getCacheStatus,
};
