/**
 * Types for the YouTube API adapter
 */

// Import SortBy type directly from youtubei.js
import type { Types } from 'youtubei.js';

// Search results type
export interface YouTubeVideoSearchResult {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string; // in ISO 8601 format (PT1H2M3S)
}

// Channel search result type
export interface YouTubeChannelSearchResult {
  id: string;
  channelShortId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: string;
  videoCount: string;
  isVerified: boolean;
}

// Video details type
export interface YouTubeVideoDetails extends YouTubeVideoSearchResult {
  channelId: string;
  tags: string[];
  category: string;
  likeCount: string;
  commentCount: string;
}

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
  continuation?: string;
  estimatedResults?: number;
}

// Adapter interface
export interface YouTubeApiAdapter {
  /**
   * Search for videos by query
   * @param params Search parameters
   * @returns Promise with search results or error
   */
  searchVideos(params: YouTubeSearchParams): Promise<YouTubeApiResponse<YouTubeVideoSearchResult[]>>;
  
  /**
   * Search for channels by query
   * @param params Search parameters
   * @returns Promise with search results or error
   */
  searchChannels(params: YouTubeChannelSearchParams): Promise<YouTubeApiResponse<YouTubeChannelSearchResult[]>>;
  
  /**
   * Get video details by ID
   * @param params Video parameters
   * @returns Promise with video details or error
   */
  getVideoDetails(params: YouTubeVideoParams): Promise<YouTubeApiResponse<YouTubeVideoDetails>>;

  /**
   * Get videos from a specific channel
   * @param params Channel parameters
   * @returns Promise with channel videos or error
   */
  getChannelVideos(params: YouTubeChannelParams): Promise<YouTubeApiResponse<YouTubeVideoSearchResult[]>>;
}
