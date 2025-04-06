/**
 * Server-side implementation for YouTube API
 */

import { YouTubeChannelResponse } from '@/shared/types/youtube';
import { createYouTubeAdapter } from '../../server/youtube/youtubeAdapter';
import {
  YouTubeSearchRequest,
  YouTubeSearchResponse,
  YouTubeVideoRequest,
  YouTubeVideoResponse,
  YouTubeChannelSearchRequest,
  YouTubeChannelSearchResponse,
  
} from './types';
import { YouTubeChannelParams } from '@/server/youtube';

// Create YouTube adapter
const youtubeAdapter = createYouTubeAdapter();

/**
 * Search for YouTube videos and channels
 * @param request Search parameters
 * @returns Promise with search results or error
 */
export const searchYouTubeVideos = async (
  request: YouTubeSearchRequest
): Promise<YouTubeSearchResponse> => {
  try {
    const { query, pageNumber } = request;
    
    // Validate input
    if (!query || typeof query !== 'string') {
      return {
        error: {
          message: 'Invalid query parameter',
          code: 'INVALID_PARAM',
        },
      };
    }
    
    // Call the YouTube adapter with all parameters including filters for videos
    const videoResponse = await youtubeAdapter.searchVideos({
      query,
      sortBy: request.filters?.sort_by,
      upload_date: request.filters?.upload_date,
      type: request.filters?.type,
      duration: request.filters?.duration,
      features: request.filters?.features,
      minViews: request.filters?.minViews,
      pageNumber
    });
    
    // Only search for channels on the first page (not during pagination)
    let channelResponse;
    if (!pageNumber || pageNumber === 1) {
      // Also search for channels with the same query
      channelResponse = await youtubeAdapter.searchChannels({
        query,
      });
    } else {
      // Empty channel response for pagination requests
      channelResponse = { data: [] };
    }
    
    // Return the combined response with consistent structure
    return {
      videos: videoResponse.data,
      filteredVideos: videoResponse.filteredVideos,
      channels: channelResponse.data,
      continuation: videoResponse.continuation,
      estimatedResults: videoResponse.estimatedResults,
      error: videoResponse.error || channelResponse.error,
    };
  } catch (error) {
    console.error('Error in searchYouTubeVideos:', error);
    return {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'SERVER_ERROR',
      },
    };
  }
};

/**
 * Search for YouTube channels
 * @param request Search parameters
 * @returns Promise with search results or error
 */
export const searchYouTubeChannels = async (
  request: YouTubeChannelSearchRequest
): Promise<YouTubeChannelSearchResponse> => {
  try {
    const { query } = request;
    
    // Validate input
    if (!query || typeof query !== 'string') {
      return {
        error: {
          message: 'Invalid query parameter',
          code: 'INVALID_PARAM',
        },
      };
    }
    
    // Call the YouTube adapter
    const response = await youtubeAdapter.searchChannels({
      query,
    });
    
    // Return the response with consistent structure
    return {
      channels: response.data,
      error: response.error,
    };
  } catch (error) {
    console.error('Error in searchYouTubeChannels:', error);
    return {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'SERVER_ERROR',
      },
    };
  }
};

/**
 * Get YouTube video details by ID
 * @param request Video parameters
 * @returns Promise with video details or error
 */
export const getYouTubeVideoDetails = async (
  request: YouTubeVideoRequest
): Promise<YouTubeVideoResponse> => {
  try {
    const { videoId } = request;
    
    // Validate input
    if (!videoId || typeof videoId !== 'string') {
      return {
        error: {
          message: 'Invalid videoId parameter',
          code: 'INVALID_PARAM',
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
    console.error('Error in getYouTubeVideoDetails:', error);
    return {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'SERVER_ERROR',
      },
    };
  }
};

/**
 * Get videos from a YouTube channel
 * @param request Channel parameters
 * @returns Promise with channel videos or error
 */
export const getYouTubeChannelVideos = async (
  request: YouTubeChannelParams
): Promise<YouTubeChannelResponse> => {
  try {
    const { channelId } = request;
    
    // Validate input
    if (!channelId || typeof channelId !== 'string') {
      return {
        error: {
          message: 'Invalid channelId parameter',
          code: 'INVALID_PARAM',
        },
      };
    }
    
    // Call the YouTube adapter
    return youtubeAdapter.getChannelVideos(request);
  } catch (error) {
    console.error('Error in getYouTubeChannelVideos:', error);
    return {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'SERVER_ERROR',
      },
    };
  }
};

// Re-export with original names for backward compatibility
export const searchVideos = searchYouTubeVideos;
export const getVideoDetails = getYouTubeVideoDetails;
export const getChannelVideos = getYouTubeChannelVideos;
export const searchChannels = searchYouTubeChannels;
