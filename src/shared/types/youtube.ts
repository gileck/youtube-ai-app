/**
 * Shared types for YouTube API
 * This file serves as the single source of truth for all YouTube-related types
 * used across both server and client code.
 */

import { YouTubeChannelInfo } from '@/apis/youtube';
import { YouTubeChannelParams } from '@/server/youtube';
import type { Types } from 'youtubei.js';

// ==========================================
// Common Result Types
// ==========================================

/**
 * Video search result type
 */
export interface YouTubeVideoSearchResult {
  id: string;
  channelId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string; 
}

/**
 * Channel search result type
 */
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

/**
 * Video details type - extends search result with additional details
 */
export interface YouTubeVideoDetails extends YouTubeVideoSearchResult {
  channelId: string;
  tags: string[];
  category: string;
  likeCount: string;
  commentCount: string;
}

/**
 * Sort options - matching the YouTube API's sort options
 */
export type YouTubeSortOption = Types.SortBy;

/**
 * Error type for YouTube API responses
 */
export interface YouTubeApiError {
  message: string;
  code: string;
}

// ==========================================
// Server-Side Types
// ==========================================

/**
 * Search parameters with filter options (server-side)
 */
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
  continuation?: boolean;
  pageNumber?: number; // Page number for pagination
}

/**
 * Channel search parameters (server-side)
 */
export interface YouTubeChannelSearchParams {
  query: string;
}

/**
 * Video details parameters (server-side)
 */
export interface YouTubeVideoParams {
  videoId: string;
}

/**
 * Response wrapper type with error handling (server-side)
 */
export interface YouTubeApiResponse<T> {
  data?: T;
  filteredVideos?: T;
  error?: YouTubeApiError;
  continuation?: boolean;
  estimatedResults?: number;
}

// ==========================================
// Client-Side Types
// ==========================================

/**
 * Search filters type (client-side)
 */
export interface YouTubeSearchFilters {
  sort_by?: YouTubeSortOption;
  upload_date?: Types.UploadDate;
  type?: Types.SearchType;
  duration?: Types.Duration;
  features?: Types.Feature[];
  minViews?: number;
}

/**
 * Search request type (client-side)
 */
export interface YouTubeSearchRequest {
  query: string;
  filters?: YouTubeSearchFilters;
  continuation?: boolean;
  pageNumber?: number;
}

/**
 * Search response type (client-side)
 */
export interface YouTubeSearchResponse {
  videos?: YouTubeVideoSearchResult[];
  filteredVideos?: YouTubeVideoSearchResult[];
  channels?: YouTubeChannelSearchResult[];
  continuation?: boolean;
  estimatedResults?: number;
  error?: YouTubeApiError;
}

/**
 * Channel search request type (client-side)
 */
export interface YouTubeChannelSearchRequest {
  query: string;
}

/**
 * Channel search response type (client-side)
 */
export interface YouTubeChannelSearchResponse {
  channels?: YouTubeChannelSearchResult[];
  error?: YouTubeApiError;
}

/**
 * Video details request type (client-side)
 */
export interface YouTubeVideoRequest {
  videoId: string;
}

/**
 * Video details response type (client-side)
 */
export interface YouTubeVideoResponse {
  video?: YouTubeVideoDetails;
  error?: YouTubeApiError;
}

/**
 * Channel videos request type (client-side)
 */
export interface YouTubeChannelRequest {
  channelId: string;
}

/**
 * Channel videos response type (client-side)
 */
export interface YouTubeChannelResponse {
  data?: {
    videos: YouTubeVideoSearchResult[];
    channelInfo: YouTubeChannelInfo;
    continuation: boolean;
    estimatedResults: number;
  }
  error?: YouTubeApiError
}


export interface ErrorResponse {
  error: YouTubeApiError
}

/**
 * YouTube API adapter interface
 */
export interface YouTubeApiAdapter {
  /**
   * Search for videos by query
   * @param params Search parameters
   * @returns Promise with search results or error
   */
  searchVideos(params: YouTubeSearchParams): Promise<YouTubeApiResponse<YouTubeVideoSearchResult[]>>;
  
  /**
   * Search for channels by query
   * @param params Channel search parameters
   * @returns Promise with channel results or error
   */
  searchChannels(params: YouTubeChannelSearchParams): Promise<YouTubeApiResponse<YouTubeChannelSearchResult[]>>;
  
  /**
   * Get video details by ID
   * @param params Video parameters
   * @returns Promise with video details or error
   */
  getVideoDetails(params: YouTubeVideoParams): Promise<YouTubeApiResponse<YouTubeVideoDetails>>;
  
  /**
   * Get videos from a channel by ID
   * @param params Channel parameters
   * @returns Promise with channel videos or error
   */
  getChannelVideos(params: YouTubeChannelParams): Promise<YouTubeChannelResponse>;
}
