import { DetailedItem } from '../types';

/**
 * Generate a unique ID for an item based on its answer and index
 */
export const generateItemId = (item: DetailedItem, index: number): string => {
  return `${item.answer.substring(0, 10)}-${index}`;
};

/**
 * Check if an array contains DetailedItem objects
 */
export const isDetailedItemArray = (arr: any[]): arr is DetailedItem[] => {
  return arr.length > 0 && 
    typeof arr[0] === 'object' && 
    arr[0] !== null &&
    'answer' in arr[0] && 
    'description' in arr[0] && 
    'emoji' in arr[0];
};

/**
 * Helper to find chapter timestamp in a video
 * This is a placeholder implementation
 */
export const findChapterTimestamp = (chapterTitle: string): number | undefined => {
  // This is a placeholder. In a real implementation, you would:
  // 1. Look up the chapter by title in your chapters data
  // 2. Return the timestamp in seconds
  return undefined;
}; 