import { Collection, ObjectId } from 'mongodb';
import { getDb } from '@/server/database';
import { UserBookmarks, UserBookmarksCreate, BookmarkedVideo, BookmarkedChannel } from './types';

const getBookmarksCollection = async (): Promise<Collection<UserBookmarks>> => {
  const db = await getDb();
  return db.collection<UserBookmarks>('bookmarks');
};

export const getUserBookmarks = async (userId: ObjectId | string): Promise<UserBookmarks | null> => {
  const collection = await getBookmarksCollection();
  const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
  
  return await collection.findOne({ userId: userIdObj });
};

export const createUserBookmarks = async (userId: ObjectId | string): Promise<UserBookmarks> => {
  const collection = await getBookmarksCollection();
  const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
  
  const newBookmarks: UserBookmarksCreate = {
    userId: userIdObj,
    videos: [],
    channels: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await collection.insertOne(newBookmarks as UserBookmarks);
  return { ...newBookmarks, _id: result.insertedId } as UserBookmarks;
};

export const addVideoBookmark = async (
  userId: ObjectId | string, 
  video: BookmarkedVideo
): Promise<UserBookmarks | null> => {
  const collection = await getBookmarksCollection();
  const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
  
  const result = await collection.findOneAndUpdate(
    { userId: userIdObj },
    { 
      $addToSet: { videos: video },
      $set: { updatedAt: new Date() }
    },
    { 
      returnDocument: 'after',
      upsert: true
    }
  );
  
  return result;
};

export const removeVideoBookmark = async (
  userId: ObjectId | string, 
  videoId: string
): Promise<UserBookmarks | null> => {
  const collection = await getBookmarksCollection();
  const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
  
  const result = await collection.findOneAndUpdate(
    { userId: userIdObj },
    { 
      $pull: { videos: { id: videoId } },
      $set: { updatedAt: new Date() }
    },
    { returnDocument: 'after' }
  );
  
  return result;
};

export const addChannelBookmark = async (
  userId: ObjectId | string, 
  channel: BookmarkedChannel
): Promise<UserBookmarks | null> => {
  const collection = await getBookmarksCollection();
  const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
  
  const result = await collection.findOneAndUpdate(
    { userId: userIdObj },
    { 
      $addToSet: { channels: channel },
      $set: { updatedAt: new Date() }
    },
    { 
      returnDocument: 'after',
      upsert: true
    }
  );
  
  return result;
};

export const removeChannelBookmark = async (
  userId: ObjectId | string, 
  channelId: string
): Promise<UserBookmarks | null> => {
  const collection = await getBookmarksCollection();
  const userIdObj = typeof userId === 'string' ? new ObjectId(userId) : userId;
  
  const result = await collection.findOneAndUpdate(
    { userId: userIdObj },
    { 
      $pull: { channels: { id: channelId } },
      $set: { updatedAt: new Date() }
    },
    { returnDocument: 'after' }
  );
  
  return result;
}; 