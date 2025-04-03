/**
 * YouTube API adapter exports
 */

export * from './types';
export * from './youtubeAdapter';

// Create and export a default instance for convenience
import { createYouTubeAdapter } from './youtubeAdapter';

export const youtubeAdapter = createYouTubeAdapter();
