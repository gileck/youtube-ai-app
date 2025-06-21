import { BookmarkedVideo, BookmarkedChannel } from '@/server/database/collections/bookmarks/types';

// No parameters needed - userId comes from auth context
export type GetBookmarksRequest = Record<string, never>;

export interface GetBookmarksResponse {
  videos: BookmarkedVideo[];
  channels: BookmarkedChannel[];
  error?: string;
}

export interface AddVideoBookmarkRequest {
  video: Omit<BookmarkedVideo, 'bookmarkedAt'>;
}

export interface AddVideoBookmarkResponse {
  success: boolean;
  error?: string;
}

export interface RemoveVideoBookmarkRequest {
  videoId: string;
}

export interface RemoveVideoBookmarkResponse {
  success: boolean;
  error?: string;
}

export interface AddChannelBookmarkRequest {
  channel: Omit<BookmarkedChannel, 'bookmarkedAt'>;
}

export interface AddChannelBookmarkResponse {
  success: boolean;
  error?: string;
}

export interface RemoveChannelBookmarkRequest {
  channelId: string;
}

export interface RemoveChannelBookmarkResponse {
  success: boolean;
  error?: string;
} 