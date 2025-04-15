/**
 * Server-side implementation for AI Video Actions API
 */

import { getChaptersTranscripts } from '../../server/youtube/chaptersTranscriptService';
import { AIVideoActionRequest, AIVideoActionResponse } from './types';
import { name } from './index';
import { youtubeAdapter } from '../../server/youtube';
import { processAiAction } from '@/server/ai/video-actions/aiAction';

/**
 * Process an AI video action request
 * @param request The AI video action request
 * @returns Promise with the action result or error
 */
export const process = async (
  request: AIVideoActionRequest
): Promise<AIVideoActionResponse> => {
  try {
    const { videoId, actionType, modelId } = request;
    
    // Validate input
    if (!videoId || typeof videoId !== 'string') {
      return {
        videoId: '',
        actionType,
        result: '',
        cost: { totalCost: 0 },
        error: 'Invalid videoId parameter'
      };
    }
    
    if (!actionType) {
      return {
        videoId,
        actionType: 'summary', // Default to summary if not specified
        result: '',
        cost: { totalCost: 0 },
        error: 'Invalid actionType parameter'
      };
    }
    
    // Get the chapters and transcript data
    const chaptersData = await getChaptersTranscripts(videoId);
    
    // Get the video details to retrieve the title
    const videoDetails = await youtubeAdapter.getVideoDetails({ videoId })
  
    const actionResult = await processAiAction({chaptersData, modelId, videoDetails, actionType});

    // const actionHandler = getVideoActionHandler(actionType);
    // const actionResult = await actionHandler.process(chaptersData, modelId, videoTitle);
    
    // Return the result
    return {
      videoId,
      actionType,
      result: actionResult.result,
      cost: actionResult.cost
    };
  } catch (error) {
    console.error('Error in AI video action:', error);
    return {
      videoId: request.videoId || '',
      actionType: request.actionType || 'summary',
      result: '',
      cost: { totalCost: 0 },
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Export the API name
export { name };
