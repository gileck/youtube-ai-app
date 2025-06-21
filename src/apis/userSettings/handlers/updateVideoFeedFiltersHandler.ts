import { userSettings } from '@/server/database';
import { UpdateVideoFeedFiltersRequest, UpdateVideoFeedFiltersResponse } from '../types';
import { ApiHandlerContext } from '../../types';

export const process = async (
  params: UpdateVideoFeedFiltersRequest,
  context: ApiHandlerContext
): Promise<UpdateVideoFeedFiltersResponse> => {
  if (!context.userId) {
    return {
      success: false,
      error: 'User authentication required'
    };
  }

  try {
    await userSettings.updateVideoFeedFilters(context.userId, params.filters);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error updating video feed filters:', error);
    return {
      success: false,
      error: 'Failed to update video feed filters'
    };
  }
}; 