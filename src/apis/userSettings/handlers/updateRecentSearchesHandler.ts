import { userSettings } from '@/server/database';
import { UpdateRecentSearchesRequest, UpdateRecentSearchesResponse } from '../types';
import { ApiHandlerContext } from '../../types';

export const process = async (
  params: UpdateRecentSearchesRequest,
  context: ApiHandlerContext
): Promise<UpdateRecentSearchesResponse> => {
  if (!context.userId) {
    return {
      success: false,
      error: 'User authentication required'
    };
  }

  try {
    await userSettings.updateRecentSearches(context.userId, params.searches);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error updating recent searches:', error);
    return {
      success: false,
      error: 'Failed to update recent searches'
    };
  }
}; 