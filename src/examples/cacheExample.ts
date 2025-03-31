/**
 * Example demonstrating the use of the caching system with both FS and S3 providers
 */

import { withCache, clearCache, getCacheStatus, clearAllCache } from '@/serverUtils/cache';
import { getCacheConfig } from '@/serverUtils/cache/cacheConfig';

// Example function that simulates an expensive operation
const expensiveOperation = async (param1: string, param2: number): Promise<{ result: string; timestamp: number }> => {
  console.log(`Running expensive operation with params: ${param1}, ${param2}`);
  
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    result: `Result for ${param1} with value ${param2}`,
    timestamp: Date.now()
  };
};

// Example of using the cache
const runWithCache = async () => {
  console.log('Cache configuration:');
  console.log('Provider:', getCacheConfig().provider);
  console.log('TTL:', getCacheConfig().ttl);
  console.log('S3 Cache Prefix:', getCacheConfig().s3CachePrefix);
  
  // First run - should execute the function and cache the result
  console.log('\nFirst run:');
  const firstRun = await withCache(
    () => expensiveOperation('test', 123),
    { key: 'expensiveOperation', params: { param1: 'test', param2: 123 } }
  );
  console.log('Result:', firstRun.data);
  console.log('From cache:', firstRun.isFromCache);
  console.log('Metadata:', firstRun.metadata);
  
  // Show cache provider information
  if (firstRun.metadata) {
    console.log('Cache provider used:', firstRun.metadata.provider);
  }
  
  // Second run - should retrieve from cache
  console.log('\nSecond run:');
  const secondRun = await withCache(
    () => expensiveOperation('test', 123),
    { key: 'expensiveOperation', params: { param1: 'test', param2: 123 } }
  );
  console.log('Result:', secondRun.data);
  console.log('From cache:', secondRun.isFromCache);
  
  // Show cache provider information
  if (secondRun.metadata) {
    console.log('Cache provider used:', secondRun.metadata.provider);
    console.log('Cache created at:', new Date(secondRun.metadata.createdAt).toLocaleString());
    console.log('Cache expires at:', new Date(secondRun.metadata.expiresAt).toLocaleString());
  }
  
  // Run with different parameters - should execute the function
  console.log('\nRun with different parameters:');
  const differentParams = await withCache(
    () => expensiveOperation('test', 456),
    { key: 'expensiveOperation', params: { param1: 'test', param2: 456 } }
  );
  console.log('Result:', differentParams.data);
  console.log('From cache:', differentParams.isFromCache);
  
  // Check cache status
  console.log('\nCache status:');
  const status = await getCacheStatus({ 
    key: 'expensiveOperation', 
    params: { param1: 'test', param2: 123 } 
  });
  console.log('Status:', status);
  
  if (status.metadata) {
    console.log('Cache provider:', status.metadata.provider);
  }
  
  // Clear specific cache entry
  console.log('\nClearing specific cache entry:');
  const cleared = await clearCache({ 
    key: 'expensiveOperation', 
    params: { param1: 'test', param2: 123 } 
  });
  console.log('Cleared:', cleared);
  
  // Run again after clearing - should execute the function
  console.log('\nRun after clearing:');
  const afterClear = await withCache(
    () => expensiveOperation('test', 123),
    { key: 'expensiveOperation', params: { param1: 'test', param2: 123 } }
  );
  console.log('Result:', afterClear.data);
  console.log('From cache:', afterClear.isFromCache);
  
  if (afterClear.metadata) {
    console.log('New cache provider used:', afterClear.metadata.provider);
  }
  
  // Clear all cache
  console.log('\nClearing all cache:');
  const allCleared = await clearAllCache();
  console.log('All cleared:', allCleared);
};

// Run the example
runWithCache().catch(console.error);

export {};
