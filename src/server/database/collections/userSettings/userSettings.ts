import { Collection, ObjectId } from 'mongodb';
import { getDb } from '@/server/database';
import { UserSettings, UserSettingsCreate } from './types';
import { YouTubeSearchFilters } from '@/apis/youtube/types';

const getUserSettingsCollection = async (): Promise<Collection<UserSettings>> => {
  const db = await getDb();
  return db.collection<UserSettings>('userSettings');
};

export const getUserSettings = async (userId: ObjectId | string): Promise<UserSettings | null> => {
  const collection = await getUserSettingsCollection();
  const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
  
  return await collection.findOne({ userId: userIdObj });
};

export const createDefaultUserSettings = async (userId: ObjectId | string): Promise<UserSettings> => {
  const collection = await getUserSettingsCollection();
  const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
  
  const defaultFilters: YouTubeSearchFilters = {
    upload_date: 'all',
    type: 'video',
    duration: 'all',
    sort_by: 'upload_date',
    features: [],
    minViews: 1000
  };
  
  const newSettings: UserSettingsCreate = {
    userId: userIdObj,
    searchFilters: defaultFilters,
    videoFeedFilters: { ...defaultFilters, duration: 'long' },
    recentSearches: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await collection.insertOne(newSettings as UserSettings);
  return { ...newSettings, _id: result.insertedId } as UserSettings;
};

export const updateSearchFilters = async (
  userId: ObjectId | string,
  filters: YouTubeSearchFilters
): Promise<UserSettings | null> => {
  const collection = await getUserSettingsCollection();
  const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
  
  const defaultVideoFeedFilters: YouTubeSearchFilters = {
    upload_date: 'all',
    type: 'video',
    duration: 'long',
    sort_by: 'upload_date',
    features: [],
    minViews: 0
  };
  
  const result = await collection.findOneAndUpdate(
    { userId: userIdObj },
    { 
      $set: { 
        searchFilters: filters,
        updatedAt: new Date()
      },
      $setOnInsert: {
        userId: userIdObj,
        videoFeedFilters: defaultVideoFeedFilters,
        recentSearches: [],
        createdAt: new Date()
      }
    },
    { 
      returnDocument: 'after',
      upsert: true
    }
  );
  
  return result;
};

export const updateVideoFeedFilters = async (
  userId: ObjectId | string,
  filters: YouTubeSearchFilters
): Promise<UserSettings | null> => {
  const collection = await getUserSettingsCollection();
  const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
  
  const defaultFilters: YouTubeSearchFilters = {
    upload_date: 'all',
    type: 'video',
    duration: 'all',
    sort_by: 'upload_date',
    features: [],
    minViews: 1000
  };
  
  const result = await collection.findOneAndUpdate(
    { userId: userIdObj },
    { 
      $set: { 
        videoFeedFilters: filters,
        updatedAt: new Date()
      },
      $setOnInsert: {
        userId: userIdObj,
        searchFilters: defaultFilters,
        recentSearches: [],
        createdAt: new Date()
      }
    },
    { 
      returnDocument: 'after',
      upsert: true
    }
  );
  
  return result;
};

export const updateRecentSearches = async (
  userId: ObjectId | string,
  searches: string[]
): Promise<UserSettings | null> => {
  const collection = await getUserSettingsCollection();
  const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
  
  const defaultSearchFilters: YouTubeSearchFilters = {
    upload_date: 'all',
    type: 'video',
    duration: 'all',
    sort_by: 'upload_date',
    features: [],
    minViews: 1000
  };
  
  const defaultVideoFeedFilters: YouTubeSearchFilters = {
    upload_date: 'all',
    type: 'video',
    duration: 'long',
    sort_by: 'upload_date',
    features: [],
    minViews: 0
  };
  
  const result = await collection.findOneAndUpdate(
    { userId: userIdObj },
    { 
      $set: { 
        recentSearches: searches,
        updatedAt: new Date()
      },
      $setOnInsert: {
        userId: userIdObj,
        searchFilters: defaultSearchFilters,
        videoFeedFilters: defaultVideoFeedFilters,
        createdAt: new Date()
      }
    },
    { 
      returnDocument: 'after',
      upsert: true
    }
  );
  
  return result;
}; 