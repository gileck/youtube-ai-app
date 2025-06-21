import { YouTubeSearchFilters } from '@/apis/youtube/types';

// Get user settings
export type GetUserSettingsRequest = Record<string, never>;

export interface GetUserSettingsResponse {
  searchFilters: YouTubeSearchFilters;
  videoFeedFilters: YouTubeSearchFilters;
  recentSearches: string[];
  error?: string;
}

// Update search filters
export interface UpdateSearchFiltersRequest {
  filters: YouTubeSearchFilters;
}

export interface UpdateSearchFiltersResponse {
  success: boolean;
  error?: string;
}

// Update video feed filters
export interface UpdateVideoFeedFiltersRequest {
  filters: YouTubeSearchFilters;
}

export interface UpdateVideoFeedFiltersResponse {
  success: boolean;
  error?: string;
}

// Update recent searches
export interface UpdateRecentSearchesRequest {
  searches: string[];
}

export interface UpdateRecentSearchesResponse {
  success: boolean;
  error?: string;
} 