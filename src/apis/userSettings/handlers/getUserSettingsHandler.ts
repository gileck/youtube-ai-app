import { userSettings } from '@/server/database';
import { GetUserSettingsRequest, GetUserSettingsResponse } from '../types';
import { ApiHandlerContext } from '../../types';

export const process = async (
  params: GetUserSettingsRequest,
  context: ApiHandlerContext
): Promise<GetUserSettingsResponse> => {
  if (!context.userId) {
    return {
      searchFilters: {
        upload_date: 'all',
        type: 'video',
        duration: 'all',
        sort_by: 'upload_date',
        features: [],
        minViews: 1000
      },
      videoFeedFilters: {
        upload_date: 'all',
        type: 'video',
        duration: 'long',
        sort_by: 'upload_date',
        features: [],
        minViews: 0
      },
      recentSearches: [],
      error: 'User authentication required'
    };
  }

  try {
    let userSettingsDoc = await userSettings.getUserSettings(context.userId);
    
    if (!userSettingsDoc) {
      // Create default settings if none exist
      userSettingsDoc = await userSettings.createDefaultUserSettings(context.userId);
    }
    
    return {
      searchFilters: userSettingsDoc.searchFilters,
      videoFeedFilters: userSettingsDoc.videoFeedFilters,
      recentSearches: userSettingsDoc.recentSearches
    };
  } catch (error) {
    console.error('Error getting user settings:', error);
    return {
      searchFilters: {
        upload_date: 'all',
        type: 'video',
        duration: 'all',
        sort_by: 'upload_date',
        features: [],
        minViews: 1000
      },
      videoFeedFilters: {
        upload_date: 'all',
        type: 'video',
        duration: 'long',
        sort_by: 'upload_date',
        features: [],
        minViews: 0
      },
      recentSearches: [],
      error: 'Failed to get user settings'
    };
  }
}; 