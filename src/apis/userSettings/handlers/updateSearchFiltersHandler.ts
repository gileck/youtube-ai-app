import { userSettings } from '@/server/database';
import { UpdateSearchFiltersRequest, UpdateSearchFiltersResponse } from '../types';
import { ApiHandlerContext } from '../../types';

export const process = async (
  params: UpdateSearchFiltersRequest,
  context: ApiHandlerContext
): Promise<UpdateSearchFiltersResponse> => {
  if (!context.userId) {
    return {
      success: false,
      error: 'User authentication required'
    };
  }

  try {
    await userSettings.updateSearchFilters(context.userId, params.filters);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error updating search filters:', error);
    return {
      success: false,
      error: 'Failed to update search filters'
    };
  }
}; 