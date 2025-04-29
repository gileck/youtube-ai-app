/**
 * Types for YouTube API
 */

import {
  YouTubeVideoSearchResult,
  YouTubeVideoDetails,
  YouTubeChannelSearchResult,
  YouTubeSortOption,
  YouTubeApiError
} from '@/shared/types/youtube';
import type { Types } from 'youtubei.js';
import type { CombinedTranscriptChapters } from '../../server/youtube/chaptersTranscriptService';

// Sort options - matching the server-side type
export type ServerYouTubeSortOption = YouTubeSortOption;

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
  continuation?: boolean;
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
  questions?: string[];
  error?: YouTubeApiError;
}

// Chapters and transcript request type
export interface YouTubeChaptersTranscriptRequest {
  videoId: string;
  overlapOffsetSeconds?: number;
}

// Chapters and transcript response type
export interface YouTubeChaptersTranscriptResponse {
  data?: CombinedTranscriptChapters;
  error?: YouTubeApiError;
}
