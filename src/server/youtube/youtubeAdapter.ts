import { Innertube, YTNodes } from 'youtubei.js';
import fs from 'fs';
import path from 'path';
import {
  YouTubeApiAdapter,
  YouTubeSearchParams,
  YouTubeVideoParams,
  YouTubeChannelParams,
  YouTubeApiResponse,
  YouTubeVideoSearchResult,
  YouTubeVideoDetails,
} from './types';

// Cache directory for YouTube API responses
const CACHE_DIR = path.join(process.cwd(), '.cache', 'youtube');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * YouTube API adapter implementation using youtubei.js
 */
export const createYouTubeAdapter = (): YouTubeApiAdapter => {
  // Initialize Innertube instance lazily
  let innertubeInstance: Innertube | null = null;
  
  const getInnertube = async (): Promise<Innertube> => {
    if (!innertubeInstance) {
      innertubeInstance = await Innertube.create();
    }
    return innertubeInstance;
  };

  // Helper to format duration from seconds to ISO 8601 format
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    let result = 'PT';
    if (hours > 0) result += `${hours}H`;
    if (minutes > 0) result += `${minutes}M`;
    if (remainingSeconds > 0 || (hours === 0 && minutes === 0)) {
      result += `${remainingSeconds}S`;
    }
    
    return result;
  };

  // Helper to get cache key
  const getCacheKey = (type: string, params: Record<string, unknown>): string => {
    return path.join(CACHE_DIR, `${type}-${JSON.stringify(params)}.json`);
  };

  // Helper to get cached data
  const getCachedData = <T>(cacheKey: string): T | null => {
    try {
      if (fs.existsSync(cacheKey)) {
        const cacheData = fs.readFileSync(cacheKey, 'utf-8');
        return JSON.parse(cacheData) as T;
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }
    return null;
  };

  // Helper to save data to cache
  const saveToCache = <T>(cacheKey: string, data: T): void => {
    try {
      fs.writeFileSync(cacheKey, JSON.stringify(data), 'utf-8');
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  };

  // Helper to transform video results to our format
  const transformVideoResult = (video: YTNodes.Video): YouTubeVideoSearchResult => {
    return {
      id: video.id || '',
      title: video.title?.text || '',
      description: video.description || '',
      thumbnailUrl: video.thumbnails?.[0]?.url || '',
      channelTitle: video.author?.name || '',
      publishedAt: video.published?.text || new Date().toISOString(), // Fallback to current date if published date is not available
      viewCount: video.view_count?.text || '0',
      duration: video.duration?.text || 'PT0S',
    };
  };

  return {
    async searchVideos(
      params: YouTubeSearchParams
    ): Promise<YouTubeApiResponse<YouTubeVideoSearchResult[]>> {
      try {
        const { query, maxResults = 10 } = params;
        
        // Check cache first
        const cacheKey = getCacheKey('search', params as unknown as Record<string, unknown>);
        const cachedData = getCachedData<YouTubeApiResponse<YouTubeVideoSearchResult[]>>(cacheKey);
        
        if (cachedData) {
          return cachedData;
        }
        
        const youtube = await getInnertube();
        const searchResults = await youtube.search(query, {
          type: 'video',
        });
        
        // Transform results to our format
        const videos: YouTubeVideoSearchResult[] = [];
        
        for (const result of searchResults.results) {
          if (videos.length >= maxResults) break;
          
          if (result.type === 'Video') {
            videos.push(transformVideoResult(result as YTNodes.Video));
          }
        }
        
        const response: YouTubeApiResponse<YouTubeVideoSearchResult[]> = {
          data: videos,
        };
        
        // Save to cache
        saveToCache(cacheKey, response);
        
        return response;
      } catch (error) {
        console.error('Error searching YouTube videos:', error);
        return {
          error: {
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            code: 'YOUTUBE_SEARCH_ERROR',
          },
        };
      }
    },
    
    async getVideoDetails(
      params: YouTubeVideoParams
    ): Promise<YouTubeApiResponse<YouTubeVideoDetails>> {
      try {
        const { videoId } = params;
        
        // Check cache first
        const cacheKey = getCacheKey('video', params as unknown as Record<string, unknown>);
        const cachedData = getCachedData<YouTubeApiResponse<YouTubeVideoDetails>>(cacheKey);
        
        if (cachedData) {
          return cachedData;
        }
        
        const youtube = await getInnertube();
        const videoInfo = await youtube.getInfo(videoId);
        
        // Transform to our format
        const videoDetails: YouTubeVideoDetails = {
          id: videoInfo.basic_info.id || '',
          title: videoInfo.basic_info.title || '',
          description: String(videoInfo.basic_info.short_description || ''),
          thumbnailUrl: videoInfo.basic_info.thumbnail?.[0]?.url || '',
          channelTitle: videoInfo.basic_info.channel?.name || '',
          channelId: videoInfo.basic_info.channel?.id || '',
          publishedAt: new Date().toISOString(), // Fallback to current date if published date is not available
          viewCount: String(videoInfo.basic_info.view_count || '0'),
          duration: typeof videoInfo.basic_info.duration === 'number'
            ? formatDuration(videoInfo.basic_info.duration)
            : 'PT0S',
          tags: videoInfo.basic_info.tags || [],
          category: videoInfo.basic_info.category || '',
          likeCount: String(videoInfo.basic_info.like_count || '0'),
          commentCount: '0', // Default to 0 if comment count is not available
        };
        
        const response: YouTubeApiResponse<YouTubeVideoDetails> = {
          data: videoDetails,
        };
        
        // Save to cache
        saveToCache(cacheKey, response);
        
        return response;
      } catch (error) {
        console.error('Error getting YouTube video details:', error);
        return {
          error: {
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            code: 'YOUTUBE_VIDEO_DETAILS_ERROR',
          },
        };
      }
    },

    async getChannelVideos(
      params: YouTubeChannelParams
    ): Promise<YouTubeApiResponse<YouTubeVideoSearchResult[]>> {
      try {
        const { channelId, maxResults = 10 } = params;
        
        // Check cache first
        const cacheKey = getCacheKey('channel', params as unknown as Record<string, unknown>);
        const cachedData = getCachedData<YouTubeApiResponse<YouTubeVideoSearchResult[]>>(cacheKey);
        
        if (cachedData) {
          return cachedData;
        }
        
        const youtube = await getInnertube();
        const channel = await youtube.getChannel(channelId);
        
        if (!channel) {
          return {
            error: {
              message: `Channel with ID ${channelId} not found`,
              code: 'CHANNEL_NOT_FOUND',
            },
          };
        }
        
        // Get channel videos
        const channelVideos = await channel.getVideos();
        
        // Transform results to our format
        const videos: YouTubeVideoSearchResult[] = [];
        
        for (const video of channelVideos.videos) {
          if (videos.length >= maxResults) break;
          
          if (video.type === 'Video') {
            videos.push(transformVideoResult(video as YTNodes.Video));
          }
        }
        
        const response: YouTubeApiResponse<YouTubeVideoSearchResult[]> = {
          data: videos,
        };
        
        // Save to cache
        saveToCache(cacheKey, response);
        
        return response;
      } catch (error) {
        console.error('Error getting YouTube channel videos:', error);
        return {
          error: {
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            code: 'YOUTUBE_CHANNEL_VIDEOS_ERROR',
          },
        };
      }
    },
  };
};
