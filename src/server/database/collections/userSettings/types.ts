import { ObjectId } from 'mongodb';
import { YouTubeSearchFilters } from '@/apis/youtube/types';

export interface UserSettings {
  _id: ObjectId;
  userId: ObjectId;
  searchFilters: YouTubeSearchFilters;
  videoFeedFilters: YouTubeSearchFilters;
  recentSearches: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type UserSettingsCreate = Omit<UserSettings, '_id'>;
export type UserSettingsUpdate = Partial<Omit<UserSettings, '_id' | 'userId'>>; 