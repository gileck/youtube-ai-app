import { bookmarks } from '@/server/database';
import { RemoveVideoBookmarkRequest, RemoveVideoBookmarkResponse } from '../types';
import { ApiHandlerContext } from '../../types';

export const process = async (
  params: RemoveVideoBookmarkRequest,
  context: ApiHandlerContext
): Promise<RemoveVideoBookmarkResponse> => {
  if (!context.userId) {
    return {
      success: false,
      error: 'User authentication required'
    };
  }

  try {
    await bookmarks.removeVideoBookmark(context.userId, params.videoId);
    
    return { success: true };
  } catch (error) {
    console.error('Error removing video bookmark:', error);
    return {
      success: false,
      error: 'Failed to remove video bookmark'
    };
  }
}; 