/**
 * Server-side implementation for YouTube API
 */

import { youtubeAdapter } from '@/server/youtube';
import { name } from './index';
import {
  YouTubeSearchRequest,
  YouTubeSearchResponse,
  YouTubeVideoRequest,
  YouTubeVideoResponse,
  YouTubeChannelRequest,
  YouTubeChannelResponse
} from './types';

// Export the base namespace
export { name };

// Define full API endpoint names


/**
 * Search for YouTube videos
 * @param request Search parameters
 * @returns Search results or error
 */
export const searchVideos = async (
  request: YouTubeSearchRequest
): Promise<YouTubeSearchResponse> => {
  try {
    const { query, maxResults } = request;
    
    // Validate input
    if (!query || typeof query !== 'string') {
      return {
        error: {
          message: 'Query is required and must be a string',
          code: 'INVALID_QUERY',
        },
      };
    }
    
    // Call the YouTube adapter
    const response = await youtubeAdapter.searchVideos({
      query,
      maxResults,
    });
    
    // Return the response with consistent structure
    return {
      videos: response.data,
      error: response.error,
    };
  } catch (error) {
    console.error('Error in searchVideos:', error);
    return {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'YOUTUBE_SEARCH_ERROR',
      },
    };
  }
};

/**
 * Get YouTube video details by ID
 * @param request Video parameters
 * @returns Video details or error
 */
export const getVideoDetails = async (
  request: YouTubeVideoRequest
): Promise<YouTubeVideoResponse> => {
  try {
    const { videoId } = request;
    
    // Validate input
    if (!videoId || typeof videoId !== 'string') {
      return {
        error: {
          message: 'Video ID is required and must be a string',
          code: 'INVALID_VIDEO_ID',
        },
      };
    }
    
    // Call the YouTube adapter
    const response = await youtubeAdapter.getVideoDetails({
      videoId,
    });
    
    // Return the response with consistent structure
    return {
      video: response.data,
      error: response.error,
    };
  } catch (error) {
    console.error('Error in getVideoDetails:', error);
    return {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'YOUTUBE_VIDEO_DETAILS_ERROR',
      },
    };
  }
};

/**
 * Get videos from a YouTube channel
 * @param request Channel parameters
 * @returns Channel videos or error
 */
export const getChannelVideos = async (
  request: YouTubeChannelRequest
): Promise<YouTubeChannelResponse> => {
  try {
    const { channelId, maxResults } = request;
    
    // Validate input
    if (!channelId || typeof channelId !== 'string') {
      return {
        error: {
          message: 'Channel ID is required and must be a string',
          code: 'INVALID_CHANNEL_ID',
        },
      };
    }
    
    // Call the YouTube adapter
    const response = await youtubeAdapter.getChannelVideos({
      channelId,
      maxResults,
    });
    
    // Return the response with consistent structure
    return {
      videos: response.data,
      error: response.error,
    };
  } catch (error) {
    console.error('Error in getChannelVideos:', error);
    return {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'YOUTUBE_CHANNEL_VIDEOS_ERROR',
      },
    };
  }
};
