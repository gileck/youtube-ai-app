/**
 * Client-side implementation for YouTube API
 */

import apiClient from '../../client/utils/apiClient';
import { CacheResult } from '../../server/cache/types';
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
import { 
  searchApiName, 
  videoApiName, 
  channelApiName, 
  channelSearchApiName, 
  chaptersTranscriptApiName 
} from './index';
import { YouTubeChannelParams } from '@/server/youtube';
import { YouTubeChannelResponse } from '@/shared/types/youtube';

/**
 * Search for YouTube videos and channels
 * @param request Search parameters
 * @returns Promise with search results or error
 */
export const searchYouTubeVideos = async (
  request: YouTubeSearchRequest
): Promise<CacheResult<YouTubeSearchResponse>> => {
  return apiClient.call<CacheResult<YouTubeSearchResponse>, YouTubeSearchRequest>(
    searchApiName,
    request
  );
};

/**
 * Search for YouTube channels
 * @param request Search parameters
 * @returns Promise with search results or error
 */
export const searchYouTubeChannels = async (
  request: YouTubeChannelSearchRequest
): Promise<CacheResult<YouTubeChannelSearchResponse>> => {
  return apiClient.call<CacheResult<YouTubeChannelSearchResponse>, YouTubeChannelSearchRequest>(
    channelSearchApiName,
    request,
  );
};

/**
 * Get YouTube video details by ID
 * @param request Video parameters
 * @returns Promise with video details or error
 */
export const getYouTubeVideoDetails = async (
  request: YouTubeVideoRequest
): Promise<CacheResult<YouTubeVideoResponse>> => {
  return apiClient.call<CacheResult<YouTubeVideoResponse>, YouTubeVideoRequest>(
    videoApiName,
    request
  );
};

/**
 * Get videos from a YouTube channel
 * @param request Channel parameters
 * @returns Promise with channel videos or error
 */
export const getYouTubeChannelVideos = async (
  request: YouTubeChannelParams
): Promise<CacheResult<YouTubeChannelResponse>> => {
  return apiClient.call<CacheResult<YouTubeChannelResponse>, YouTubeChannelParams>(
    channelApiName,
    request
  );
};

/**
 * Get YouTube video chapters and transcript
 * @param request Video ID and optional parameters
 * @returns Promise with chapters and transcript data or error
 */
export const getYouTubeChaptersTranscript = async (
  request: YouTubeChaptersTranscriptRequest
): Promise<CacheResult<YouTubeChaptersTranscriptResponse>> => {
  return apiClient.call<CacheResult<YouTubeChaptersTranscriptResponse>, YouTubeChaptersTranscriptRequest>(
    chaptersTranscriptApiName,
    request
  );
};
