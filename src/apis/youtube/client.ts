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
  YouTubeChannelRequest,
  YouTubeChannelResponse,
  YouTubeChannelSearchRequest,
  YouTubeChannelSearchResponse
} from './types';
import { searchApiName, videoApiName, channelApiName, channelSearchApiName } from './index';

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
  request: YouTubeChannelRequest
): Promise<CacheResult<YouTubeChannelResponse>> => {
  return apiClient.call<CacheResult<YouTubeChannelResponse>, YouTubeChannelRequest>(
    channelApiName,
    request
  );
};
