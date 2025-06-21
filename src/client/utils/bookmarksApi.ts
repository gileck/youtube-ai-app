import { YouTubeVideoSearchResult, YouTubeChannelSearchResult } from '@/shared/types/youtube';
import * as bookmarksApi from '@/apis/bookmarks/client';

// Types for bookmarks (re-export from database types)
export interface BookmarkedVideo extends YouTubeVideoSearchResult {
  bookmarkedAt: number;
}

export interface BookmarkedChannel extends YouTubeChannelSearchResult {
  bookmarkedAt: number;
}

// Get bookmarked videos
export const getBookmarkedVideos = async (): Promise<BookmarkedVideo[]> => {
  try {
    const result = await bookmarksApi.getBookmarks();
    if (result.data && !result.data.error) {
      return result.data.videos || [];
    }
  } catch (error) {
    console.error('Error fetching bookmarked videos:', error);
  }
  return [];
};

// Get bookmarked channels
export const getBookmarkedChannels = async (): Promise<BookmarkedChannel[]> => {
  try {
    const result = await bookmarksApi.getBookmarks();
    if (result.data && !result.data.error) {
      return result.data.channels || [];
    }
  } catch (error) {
    console.error('Error fetching bookmarked channels:', error);
  }
  return [];
};

// Add a video to bookmarks
export const bookmarkVideo = async (video: YouTubeVideoSearchResult): Promise<boolean> => {
  try {
    const result = await bookmarksApi.addVideoBookmark({ video });
    if (result.data?.success) {
      // Dispatch custom event for bookmark changes
      window.dispatchEvent(new CustomEvent('bookmarkChange'));
      return true;
    }
  } catch (error) {
    console.error('Error bookmarking video:', error);
  }
  return false;
};

// Remove a video from bookmarks
export const removeBookmarkedVideo = async (videoId: string): Promise<boolean> => {
  try {
    const result = await bookmarksApi.removeVideoBookmark({ videoId });
    if (result.data?.success) {
      // Dispatch custom event for bookmark changes
      window.dispatchEvent(new CustomEvent('bookmarkChange'));
      return true;
    }
  } catch (error) {
    console.error('Error removing video bookmark:', error);
  }
  return false;
};

// Check if a video is bookmarked
export const isVideoBookmarked = async (videoId: string): Promise<boolean> => {
  try {
    const result = await bookmarksApi.getBookmarks();
    if (result.data && !result.data.error) {
      const videos = result.data.videos || [];
      return videos.some(video => video.id === videoId);
    }
  } catch (error) {
    console.error('Error checking video bookmark status:', error);
  }
  return false;
};

// Add a channel to bookmarks
export const bookmarkChannel = async (channel: YouTubeChannelSearchResult): Promise<boolean> => {
  try {
    const result = await bookmarksApi.addChannelBookmark({ channel });
    if (result.data?.success) {
      // Dispatch custom event for bookmark changes
      window.dispatchEvent(new CustomEvent('bookmarkChange'));
      return true;
    }
  } catch (error) {
    console.error('Error bookmarking channel:', error);
  }
  return false;
};

// Remove a channel from bookmarks
export const removeBookmarkedChannel = async (channelId: string): Promise<boolean> => {
  try {
    const result = await bookmarksApi.removeChannelBookmark({ channelId });
    if (result.data?.success) {
      // Dispatch custom event for bookmark changes
      window.dispatchEvent(new CustomEvent('bookmarkChange'));
      return true;
    }
  } catch (error) {
    console.error('Error removing channel bookmark:', error);
  }
  return false;
};

// Check if a channel is bookmarked
export const isChannelBookmarked = async (channelId: string): Promise<boolean> => {
  try {
    const result = await bookmarksApi.getBookmarks();
    if (result.data && !result.data.error) {
      const channels = result.data.channels || [];
      return channels.some(channel => channel.id === channelId);
    }
  } catch (error) {
    console.error('Error checking channel bookmark status:', error);
  }
  return false;
}; 