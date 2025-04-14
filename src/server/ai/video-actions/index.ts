/**
 * AI Video Actions Module
 * Provides various AI-powered actions for processing video content
 */

import { VideoActionType, VideoActionHandler } from './types';
import { summaryAction } from './summary';

// Registry of available video actions
const videoActionHandlers: Record<VideoActionType, VideoActionHandler> = {
  summary: summaryAction,
  // Add more actions here as they are implemented
  highlights: summaryAction, // Placeholder - replace with actual implementation
  questions: summaryAction, // Placeholder - replace with actual implementation
};

/**
 * Get the handler for a specific video action type
 * @param actionType The type of video action to perform
 * @returns The handler for the specified action type
 */
export function getVideoActionHandler(actionType: VideoActionType): VideoActionHandler {
  const handler = videoActionHandlers[actionType];
  
  if (!handler) {
    throw new Error(`No handler found for action type: ${actionType}`);
  }
  
  return handler;
}

// Export all action types
export * from './types';
