import { YouTubeVideoSearchResult, YouTubeChannelSearchResult } from '@/shared/types/youtube';

// Types for bookmarks
export interface BookmarkedVideo extends YouTubeVideoSearchResult {
  bookmarkedAt: number;
}

export interface BookmarkedChannel extends YouTubeChannelSearchResult {
  bookmarkedAt: number;
}

// Storage keys
const BOOKMARKED_VIDEOS_KEY = 'youtube-ai-app-bookmarked-videos';
const BOOKMARKED_CHANNELS_KEY = 'youtube-ai-app-bookmarked-channels';

// Get bookmarked videos from local storage
export const getBookmarkedVideos = (): BookmarkedVideo[] => {
  if (typeof window === 'undefined') return [];
  
  const storedVideos = localStorage.getItem(BOOKMARKED_VIDEOS_KEY);
  if (!storedVideos) return [];
  
  try {
    return JSON.parse(storedVideos);
  } catch (error) {
    console.error('Error parsing bookmarked videos:', error);
    return [];
  }
};

// Get bookmarked channels from local storage
export const getBookmarkedChannels = (): BookmarkedChannel[] => {
  if (typeof window === 'undefined') return [];
  
  const storedChannels = localStorage.getItem(BOOKMARKED_CHANNELS_KEY);
  if (!storedChannels) return [];
  
  try {
    return JSON.parse(storedChannels);
  } catch (error) {
    console.error('Error parsing bookmarked channels:', error);
    return [];
  }
};

// Add a video to bookmarks
export const bookmarkVideo = (video: YouTubeVideoSearchResult): void => {
  if (typeof window === 'undefined') return;
  
  const bookmarkedVideos = getBookmarkedVideos();
  
  // Check if video is already bookmarked
  if (bookmarkedVideos.some(bv => bv.id === video.id)) return;
  
  // Add video to bookmarks with timestamp
  const bookmarkedVideo: BookmarkedVideo = {
    ...video,
    bookmarkedAt: Date.now()
  };
  
  const updatedVideos = [...bookmarkedVideos, bookmarkedVideo];
  localStorage.setItem(BOOKMARKED_VIDEOS_KEY, JSON.stringify(updatedVideos));
};

// Remove a video from bookmarks
export const removeBookmarkedVideo = (videoId: string): void => {
  if (typeof window === 'undefined') return;
  
  const bookmarkedVideos = getBookmarkedVideos();
  const updatedVideos = bookmarkedVideos.filter(video => video.id !== videoId);
  
  localStorage.setItem(BOOKMARKED_VIDEOS_KEY, JSON.stringify(updatedVideos));
};

// Check if a video is bookmarked
export const isVideoBookmarked = (videoId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const bookmarkedVideos = getBookmarkedVideos();
  return bookmarkedVideos.some(video => video.id === videoId);
};

// Add a channel to bookmarks
export const bookmarkChannel = (channel: YouTubeChannelSearchResult): void => {
  if (typeof window === 'undefined') return;
  
  const bookmarkedChannels = getBookmarkedChannels();
  
  // Check if channel is already bookmarked
  if (bookmarkedChannels.some(bc => bc.id === channel.id)) return;
  
  // Add channel to bookmarks with timestamp
  const bookmarkedChannel: BookmarkedChannel = {
    ...channel,
    bookmarkedAt: Date.now()
  };
  
  const updatedChannels = [...bookmarkedChannels, bookmarkedChannel];
  localStorage.setItem(BOOKMARKED_CHANNELS_KEY, JSON.stringify(updatedChannels));
};

// Remove a channel from bookmarks
export const removeBookmarkedChannel = (channelId: string): void => {
  if (typeof window === 'undefined') return;
  
  const bookmarkedChannels = getBookmarkedChannels();
  const updatedChannels = bookmarkedChannels.filter(channel => channel.id !== channelId);
  
  localStorage.setItem(BOOKMARKED_CHANNELS_KEY, JSON.stringify(updatedChannels));
};

// Check if a channel is bookmarked
export const isChannelBookmarked = (channelId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const bookmarkedChannels = getBookmarkedChannels();
  return bookmarkedChannels.some(channel => channel.id === channelId);
};
