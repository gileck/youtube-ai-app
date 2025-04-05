/**
 * Types for YouTube API
 */

import { 
  YouTubeVideoSearchResult, 
  YouTubeVideoDetails, 
  YouTubeSortOption as ServerYouTubeSortOption,
  YouTubeChannelSearchResult,
  YouTubeApiError
} from '../../server/youtube/types';
import type { Types } from 'youtubei.js';

// Re-export common types
export type { 
  YouTubeVideoSearchResult,
  YouTubeVideoDetails,
  YouTubeChannelSearchResult
};

// Sort options - matching the server-side type
export type YouTubeSortOption = ServerYouTubeSortOption;

// Search filters type
export interface YouTubeSearchFilters {
  sort_by?: YouTubeSortOption;
  upload_date?: Types.UploadDate;
  type?: Types.SearchType;
  duration?: Types.Duration;
  features?: Types.Feature[];
  minViews?: number;
}

// Search request type
export interface YouTubeSearchRequest {
  query: string;
  filters?: YouTubeSearchFilters;
  pageNumber?: number;
}

// Search response type
export interface YouTubeSearchResponse {
  videos?: YouTubeVideoSearchResult[];
  filteredVideos?: YouTubeVideoSearchResult[];
  channels?: YouTubeChannelSearchResult[];
  continuation?: string;
  estimatedResults?: number;
  error?: YouTubeApiError;
}

// Channel search request type
export interface YouTubeChannelSearchRequest {
  query: string;
}

// Channel search response type
export interface YouTubeChannelSearchResponse {
  channels?: YouTubeChannelSearchResult[];
  error?: YouTubeApiError;
}

// Video details request type
export interface YouTubeVideoRequest {
  videoId: string;
}

// Video details response type
export interface YouTubeVideoResponse {
  video?: YouTubeVideoDetails;
  error?: YouTubeApiError;
}

// Channel videos request type
export interface YouTubeChannelRequest {
  channelId: string;
}

// Channel videos response type
export interface YouTubeChannelResponse {
  videos?: YouTubeVideoSearchResult[];
  error?: YouTubeApiError;
}
