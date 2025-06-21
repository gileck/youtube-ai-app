import { bookmarks } from '@/server/database';
import { AddChannelBookmarkRequest, AddChannelBookmarkResponse } from '../types';
import { ApiHandlerContext } from '../../types';

export const process = async (
  params: AddChannelBookmarkRequest,
  context: ApiHandlerContext
): Promise<AddChannelBookmarkResponse> => {
  if (!context.userId) {
    return {
      success: false,
      error: 'User authentication required'
    };
  }

  try {
    const bookmarkedChannel = {
      ...params.channel,
      bookmarkedAt: Date.now()
    };
    
    await bookmarks.addChannelBookmark(context.userId, bookmarkedChannel);
    
    return { success: true };
  } catch (error) {
    console.error('Error adding channel bookmark:', error);
    return {
      success: false,
      error: 'Failed to add channel bookmark'
    };
  }
}; 