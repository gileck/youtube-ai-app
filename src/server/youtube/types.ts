/**
 * Types for the YouTube API adapter
 */

// Import all YouTube types from shared/types/youtube
import { YouTubeVideoDetails, YouTubeChannelSearchResult, YouTubeChannelInfo, YouTubeSearchFilters, YouTubeChannelResponse, YouTubeVideoSearchResult, YouTubeSearchVideosResponse, YouTubeSearchChannelsResponse } from '@/shared/types/youtube';
import type { Types } from 'youtubei.js';

// Define our own YouTubeSortOption type matching the YouTube API's sort options
// These values match the SortBy type from youtubei.js
export type YouTubeSortOption = Types.SortBy;

// Search parameters with filter options
export interface YouTubeSearchParams {
  query: string;
  sortBy?: YouTubeSortOption;
  
  // Filter options
  upload_date?: Types.UploadDate;
  type?: Types.SearchType;
  duration?: Types.Duration;
  features?: Types.Feature[];
  minViews?: number; // Minimum view count filter
  
  // Pagination
  pageNumber?: number; // Page number for pagination
}

// Channel search parameters
export interface YouTubeChannelSearchParams {
  query: string;
}

// Get video parameters
export interface YouTubeVideoParams {
  videoId: string;
}

// Get channel videos parameters
export interface YouTubeChannelParams {
  channelId: string;
  filters?: YouTubeSearchFilters;
  pageNumber?: number;
}

// Error type
export interface YouTubeApiError {
  message: string;
  code: string;
}

// Response wrapper type with error handling
export interface YouTubeApiResponse<T> {
  data?: T;
  filteredVideos?: T;
  error?: YouTubeApiError;
  continuation?: boolean;
  estimatedResults?: number;
  channelInfo?: YouTubeChannelInfo;
}

// Adapter interface
export interface YouTubeApiAdapter {
  /**
   * Search for videos by query
   * @param params Search parameters
   * @returns Promise with search results or error
   */
  searchVideos(params: YouTubeSearchParams): Promise<YouTubeSearchVideosResponse<YouTubeVideoSearchResult[]>>;
  
  /**
   * Search for channels by query
   * @param params Search parameters
   * @returns Promise with search results or error
   */
  searchChannels(params: YouTubeChannelSearchParams): Promise<YouTubeSearchChannelsResponse<YouTubeChannelSearchResult[]>>;
  
  /**
   * Get video details by ID
   * @param params Video parameters
   * @returns Promise with video details or error
   */
  getVideoDetails(params: YouTubeVideoParams): Promise<YouTubeVideoDetails | null>;

  /**
   * Get videos from a specific channel
   * @param params Channel parameters
   * @returns Promise with channel videos or error
   */
  getChannelVideos(params: YouTubeChannelParams): Promise<YouTubeChannelResponse>;
}

export interface TranscriptSegment {
  text: string;
  offset: number;  // in seconds
  duration: number; // in seconds
  relativeOffset: number; // position within chapter (0-1)
}

export interface ChapterWithContent {
  title: string;
  startTime: number;
  endTime: number;
  content: string;
  segments: TranscriptSegment[];
}