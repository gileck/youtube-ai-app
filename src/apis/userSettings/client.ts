import { apiClient } from '@/client/utils/apiClient';
import { CacheResult } from '@/common/cache/types';
import {
  GET_USER_SETTINGS,
  UPDATE_SEARCH_FILTERS,
  UPDATE_VIDEO_FEED_FILTERS,
  UPDATE_RECENT_SEARCHES
} from './index';
import {
  GetUserSettingsRequest,
  GetUserSettingsResponse,
  UpdateSearchFiltersRequest,
  UpdateSearchFiltersResponse,
  UpdateVideoFeedFiltersRequest,
  UpdateVideoFeedFiltersResponse,
  UpdateRecentSearchesRequest,
  UpdateRecentSearchesResponse
} from './types';

export const getUserSettings = (
  params: GetUserSettingsRequest = {}
): Promise<CacheResult<GetUserSettingsResponse>> => {
  return apiClient.call(GET_USER_SETTINGS, params);
};

export const updateSearchFilters = (
  params: UpdateSearchFiltersRequest
): Promise<CacheResult<UpdateSearchFiltersResponse>> => {
  return apiClient.call(UPDATE_SEARCH_FILTERS, params);
};

export const updateVideoFeedFilters = (
  params: UpdateVideoFeedFiltersRequest
): Promise<CacheResult<UpdateVideoFeedFiltersResponse>> => {
  return apiClient.call(UPDATE_VIDEO_FEED_FILTERS, params);
};

export const updateRecentSearches = (
  params: UpdateRecentSearchesRequest
): Promise<CacheResult<UpdateRecentSearchesResponse>> => {
  return apiClient.call(UPDATE_RECENT_SEARCHES, params);
}; 