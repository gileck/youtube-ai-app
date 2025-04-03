/**
 * Types for YouTube API
 */

import { YouTubeVideoSearchResult, YouTubeVideoDetails } from '../../server/youtube/types';

// Search request type
export interface YouTubeSearchRequest {
  query: string;
  maxResults?: number;
}

// Search response type
export interface YouTubeSearchResponse {
  videos?: YouTubeVideoSearchResult[];
  error?: {
    message: string;
    code: string;
  };
}

// Video details request type
export interface YouTubeVideoRequest {
  videoId: string;
}

// Video details response type
export interface YouTubeVideoResponse {
  video?: YouTubeVideoDetails;
  error?: {
    message: string;
    code: string;
  };
}

// Channel videos request type
export interface YouTubeChannelRequest {
  channelId: string;
  maxResults?: number;
}

// Channel videos response type
export interface YouTubeChannelResponse {
  videos?: YouTubeVideoSearchResult[];
  error?: {
    message: string;
    code: string;
  };
}
