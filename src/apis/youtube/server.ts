/**
 * Server-side implementation for YouTube API
 */

export * from './index';

import { YouTubeChannelResponse } from '@/shared/types/youtube';
import { createYouTubeAdapter } from '../../server/youtube/youtubeAdapter';
import {
  YouTubeSearchRequest,
  YouTubeSearchResponse,
  YouTubeVideoRequest,
  YouTubeVideoResponse,
  YouTubeChannelSearchRequest,
  YouTubeChannelSearchResponse,
  YouTubeChaptersTranscriptRequest,
  YouTubeChaptersTranscriptResponse
} from './types';
import { YouTubeChannelParams } from '@/server/youtube';
import { getChaptersTranscripts } from '../../server/youtube/chaptersTranscriptService';
import { AIModelAdapter } from '../../server/ai';

// Create YouTube adapter
const youtubeAdapter = createYouTubeAdapter();

// Create AI adapter
const aiAdapter = new AIModelAdapter();

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
    const { videos, filteredVideos, continuation, estimatedResults } = await youtubeAdapter.searchVideos({
      query,
      sortBy: request.filters?.sort_by,
      upload_date: request.filters?.upload_date,
      type: request.filters?.type,
      duration: request.filters?.duration,
      features: request.filters?.features,
      minViews: request.filters?.minViews,
      pageNumber
    });

    const { channels } = await youtubeAdapter.searchChannels({
      query,
    });

    // Return the combined response with consistent structure
    return {
      videos,
      filteredVideos,
      channels,
      continuation,
      estimatedResults,
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
    const { channels } = await youtubeAdapter.searchChannels({
      query,
    });

    // Return the response with consistent structure
    return {
      channels,
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

    if (!response) {
      return {
        error: {
          message: 'Video not found',
          code: 'VIDEO_NOT_FOUND',
        },
      };
    }

    // Generate questions using AI adapter
    let videoQuestions: string[] = [];
    if (response.title && response.description) {
      try {
        const prompt = `Generate 5 interesting questions that this video answers based on the title and description. Return only the questions as a JSON array of strings.
Title: ${response.title}
Description: ${response.description}`;

        const questionsResponse = await aiAdapter.processPromptToJSON<string[]>(prompt, 'video-questions');
        videoQuestions = questionsResponse.result;
      } catch (error) {
        console.error('Error generating questions:', error);
        videoQuestions = [];
      }
    }

    // Return the response with consistent structure and questions
    return {
      video: response,
      questions: videoQuestions,
    }
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

/**
 * Get YouTube video chapters and transcript
 * @param request Video ID and optional parameters
 * @returns Promise with chapters and transcript data or error
 */
export const getYouTubeChaptersTranscript = async (
  request: YouTubeChaptersTranscriptRequest
): Promise<YouTubeChaptersTranscriptResponse> => {
  try {
    const { videoId, overlapOffsetSeconds } = request;

    // Validate input
    if (!videoId || typeof videoId !== 'string') {
      return {
        error: {
          message: 'Invalid videoId parameter',
          code: 'INVALID_PARAM',
        },
      };
    }

    // Call the chapters transcript service
    const result = await getChaptersTranscripts(videoId, {
      overlapOffsetSeconds: overlapOffsetSeconds || 5
    });

    return {
      data: result,
    };
  } catch (error) {
    console.error('Error in getYouTubeChaptersTranscript:', error);
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
