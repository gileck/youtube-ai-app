/**
 * Types for the YouTube API adapter
 */

// Search results type
export interface YouTubeVideoSearchResult {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string; // in ISO 8601 format (PT1H2M3S)
}

// Video details type
export interface YouTubeVideoDetails extends YouTubeVideoSearchResult {
  channelId: string;
  tags: string[];
  category: string;
  likeCount: string;
  commentCount: string;
}

// Search parameters
export interface YouTubeSearchParams {
  query: string;
  maxResults?: number; // Default can be set in the implementation
}

// Get video parameters
export interface YouTubeVideoParams {
  videoId: string;
}

// Get channel videos parameters
export interface YouTubeChannelParams {
  channelId: string;
  maxResults?: number; // Default can be set in the implementation
}

// Error type
export interface YouTubeApiError {
  message: string;
  code: string;
}

// Response wrapper type with error handling
export interface YouTubeApiResponse<T> {
  data?: T;
  error?: YouTubeApiError;
}

// Adapter interface
export interface YouTubeApiAdapter {
  /**
   * Search for videos by query
   * @param params Search parameters
   * @returns Promise with search results or error
   */
  searchVideos(params: YouTubeSearchParams): Promise<YouTubeApiResponse<YouTubeVideoSearchResult[]>>;
  
  /**
   * Get video details by ID
   * @param params Video parameters
   * @returns Promise with video details or error
   */
  getVideoDetails(params: YouTubeVideoParams): Promise<YouTubeApiResponse<YouTubeVideoDetails>>;

  /**
   * Get videos from a specific channel
   * @param params Channel parameters
   * @returns Promise with channel videos or error
   */
  getChannelVideos(params: YouTubeChannelParams): Promise<YouTubeApiResponse<YouTubeVideoSearchResult[]>>;
}
