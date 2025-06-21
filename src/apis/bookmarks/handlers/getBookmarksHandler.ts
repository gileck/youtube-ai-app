import { bookmarks } from '@/server/database';
import { GetBookmarksRequest, GetBookmarksResponse } from '../types';
import { ApiHandlerContext } from '../../types';

export const process = async (
  params: GetBookmarksRequest,
  context: ApiHandlerContext
): Promise<GetBookmarksResponse> => {
  if (!context.userId) {
    return {
      videos: [],
      channels: [],
      error: 'User authentication required'
    };
  }

  try {
    const userBookmarks = await bookmarks.getUserBookmarks(context.userId);
    
    if (!userBookmarks) {
      return { videos: [], channels: [] };
    }
    
    return {
      videos: userBookmarks.videos || [],
      channels: userBookmarks.channels || []
    };
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return {
      videos: [],
      channels: [],
      error: 'Failed to get bookmarks'
    };
  }
}; 