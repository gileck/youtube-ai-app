import { bookmarks } from '@/server/database';
import { RemoveChannelBookmarkRequest, RemoveChannelBookmarkResponse } from '../types';
import { ApiHandlerContext } from '../../types';

export const process = async (
  params: RemoveChannelBookmarkRequest,
  context: ApiHandlerContext
): Promise<RemoveChannelBookmarkResponse> => {
  if (!context.userId) {
    return {
      success: false,
      error: 'User authentication required'
    };
  }

  try {
    await bookmarks.removeChannelBookmark(context.userId, params.channelId);
    
    return { success: true };
  } catch (error) {
    console.error('Error removing channel bookmark:', error);
    return {
      success: false,
      error: 'Failed to remove channel bookmark'
    };
  }
}; 