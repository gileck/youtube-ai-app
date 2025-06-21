import { ObjectId } from 'mongodb';
import { YouTubeVideoSearchResult, YouTubeChannelSearchResult } from '@/shared/types/youtube';

export interface BookmarkedVideo extends YouTubeVideoSearchResult {
  bookmarkedAt: number;
}

export interface BookmarkedChannel extends YouTubeChannelSearchResult {
  bookmarkedAt: number;
}

export interface UserBookmarks {
  _id: ObjectId;
  userId: ObjectId;
  videos: BookmarkedVideo[];
  channels: BookmarkedChannel[];
  createdAt: Date;
  updatedAt: Date;
}

export type UserBookmarksCreate = Omit<UserBookmarks, '_id'>;
export type UserBookmarksUpdate = Partial<Omit<UserBookmarks, '_id' | 'userId'>>; 