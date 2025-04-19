/**
 * Server-side implementation for AI Video Actions API
 */

import { getChaptersTranscripts } from '../../server/youtube/chaptersTranscriptService';
import { AIVideoActionRequest, AIVideoActionResponse } from './types';
import { name } from './index';
import { youtubeAdapter } from '../../server/youtube';
import { processAiAction } from '@/services/AiActions/video-actions/aiAction';

/**
 * Process an AI video action request
 * @param request The AI video action request
 * @returns Promise with the action result or error
 */
export const process = async (
  request: AIVideoActionRequest
): Promise<AIVideoActionResponse<unknown>> => {
  try {
    const { videoId, actionType, modelId, actionParams } = request;
    
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
        actionType,
        result: '',
        cost: { totalCost: 0 },
        error: 'Invalid actionType parameter'
      };
    }
    
    const chaptersData = await getChaptersTranscripts(videoId);
    const videoDetails = await youtubeAdapter.getVideoDetails({ videoId })
    const actionResult = await processAiAction({chaptersData, modelId, videoDetails, actionType, actionParams});

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
      actionType: request.actionType,
      result: '',
      cost: { totalCost: 0 },
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Export the API name
export { name };
