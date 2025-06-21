import { getUserSettings, updateSearchFilters, updateVideoFeedFilters, updateRecentSearches } from '@/apis/userSettings/client';
import { YouTubeSearchFilters } from '@/apis/youtube/types';

// Get user settings with default fallbacks
export const loadUserSettings = async () => {
  try {
    const response = await getUserSettings();
    
    // If user is not authenticated, check localStorage for fallback
    if (response.data.error === 'User authentication required') {
      const searchFilters = localStorage.getItem('youtube_search_filters');
      const videoFeedFilters = localStorage.getItem('youtube_feed_filters');
      const recentSearches = localStorage.getItem('youtube_recent_searches');
      
      return {
        searchFilters: searchFilters ? JSON.parse(searchFilters) : {
          upload_date: 'all' as const,
          type: 'video' as const,
          duration: 'all' as const,
          sort_by: 'upload_date' as const,
          features: [],
          minViews: 1000
        },
        videoFeedFilters: videoFeedFilters ? JSON.parse(videoFeedFilters) : {
          upload_date: 'all' as const,
          type: 'video' as const,
          duration: 'long' as const,
          sort_by: 'upload_date' as const,
          features: [],
          minViews: 0
        },
        recentSearches: recentSearches ? JSON.parse(recentSearches) : []
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Failed to load user settings:', error);
    
    // Fallback to localStorage on error
    const searchFilters = localStorage.getItem('youtube_search_filters');
    const videoFeedFilters = localStorage.getItem('youtube_feed_filters');
    const recentSearches = localStorage.getItem('youtube_recent_searches');
    
    return {
      searchFilters: searchFilters ? JSON.parse(searchFilters) : {
        upload_date: 'all' as const,
        type: 'video' as const,
        duration: 'all' as const,
        sort_by: 'upload_date' as const,
        features: [],
        minViews: 1000
      },
      videoFeedFilters: videoFeedFilters ? JSON.parse(videoFeedFilters) : {
        upload_date: 'all' as const,
        type: 'video' as const,
        duration: 'long' as const,
        sort_by: 'upload_date' as const,
        features: [],
        minViews: 0
      },
      recentSearches: recentSearches ? JSON.parse(recentSearches) : []
    };
  }
};

// Save search filters
export const saveSearchFilters = async (filters: YouTubeSearchFilters) => {
  try {
    const response = await updateSearchFilters({ filters });
    if (!response.data.success) {
      console.error('Failed to save search filters:', response.data.error);
      // Fallback to localStorage if user is not authenticated
      if (response.data.error === 'User authentication required') {
        localStorage.setItem('youtube_search_filters', JSON.stringify(filters));
        return true;
      }
    }
    return response.data.success;
  } catch (error) {
    console.error('Failed to save search filters:', error);
    // Fallback to localStorage on error
    localStorage.setItem('youtube_search_filters', JSON.stringify(filters));
    return true;
  }
};

// Save video feed filters
export const saveVideoFeedFilters = async (filters: YouTubeSearchFilters) => {
  try {
    const response = await updateVideoFeedFilters({ filters });
    if (!response.data.success) {
      console.error('Failed to save video feed filters:', response.data.error);
      // Fallback to localStorage if user is not authenticated
      if (response.data.error === 'User authentication required') {
        localStorage.setItem('youtube_feed_filters', JSON.stringify(filters));
        return true;
      }
    }
    return response.data.success;
  } catch (error) {
    console.error('Failed to save video feed filters:', error);
    // Fallback to localStorage on error
    localStorage.setItem('youtube_feed_filters', JSON.stringify(filters));
    return true;
  }
};

// Save recent searches
export const saveRecentSearches = async (searches: string[]) => {
  try {
    const response = await updateRecentSearches({ searches });
    if (!response.data.success) {
      console.error('Failed to save recent searches:', response.data.error);
      // Fallback to localStorage if user is not authenticated
      if (response.data.error === 'User authentication required') {
        localStorage.setItem('youtube_recent_searches', JSON.stringify(searches));
        return true;
      }
    }
    return response.data.success;
  } catch (error) {
    console.error('Failed to save recent searches:', error);
    // Fallback to localStorage on error
    localStorage.setItem('youtube_recent_searches', JSON.stringify(searches));
    return true;
  }
};