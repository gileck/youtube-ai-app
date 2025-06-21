import { bookmarks } from '@/server/database';
import { AddVideoBookmarkRequest, AddVideoBookmarkResponse } from '../types';
import { ApiHandlerContext } from '../../types';

export const process = async (
  params: AddVideoBookmarkRequest,
  context: ApiHandlerContext
): Promise<AddVideoBookmarkResponse> => {
  if (!context.userId) {
    return {
      success: false,
      error: 'User authentication required'
    };
  }

  try {
    const bookmarkedVideo = {
      ...params.video,
      bookmarkedAt: Date.now()
    };
    
    await bookmarks.addVideoBookmark(context.userId, bookmarkedVideo);
    
    return { success: true };
  } catch (error) {
    console.error('Error adding video bookmark:', error);
    return {
      success: false,
      error: 'Failed to add video bookmark'
    };
  }
}; 