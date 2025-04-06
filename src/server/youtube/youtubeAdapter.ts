import { Innertube, YTNodes } from 'youtubei.js';
import type { Types } from 'youtubei.js';

import {
  YouTubeApiAdapter,
  YouTubeSearchParams,
  YouTubeVideoParams,
  YouTubeChannelParams,
  YouTubeApiResponse,
  YouTubeVideoSearchResult,
  YouTubeVideoDetails,
  YouTubeChannelSearchParams,
  YouTubeChannelSearchResult,
  YouTubeChannelInfo
} from './types';
import { YouTubeChannelResponse } from '@/shared/types/youtube';

/**
 * YouTube API adapter implementation using youtubei.js
 */
export const createYouTubeAdapter = (): YouTubeApiAdapter => {
  // Initialize Innertube instance lazily`
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

  // Helper to transform video results to our format
  const transformVideoResult = (video: YTNodes.Video): YouTubeVideoSearchResult => {
    return {
      id: video.id || '',
      title: video.title?.text || '',
      description: video.description || '',
      thumbnailUrl: video.thumbnails?.[0]?.url || '',
      channelTitle: video.author?.name || '',
      channelId: video.author?.id || '',
      publishedAt: video.published?.text || new Date().toISOString(), // Fallback to current date if published date is not available
      viewCount: video.view_count?.text || '0',
      duration: video.duration?.text || 'PT0S',
    };
  };
  
  // Helper to transform channel results to our format
  /**
   * 
   * subscriber_count: Text { text: '@drandygalpin' },
  video_count: Text { text: '162K subscribers' },
   */
  const transformChannelResult = (channel: YTNodes.Channel): YouTubeChannelSearchResult => {
    return {
      id: channel.id || '',
      title: channel.author?.name || '',
      description: channel.description_snippet?.text || '',
      thumbnailUrl: channel.author?.thumbnails?.[0]?.url || '',
      // subscriberCount: channel.subscriber_count?.text || '0 subscribers',
      subscriberCount: channel.video_count?.text || '',
      channelShortId: channel.subscriber_count?.text || '',
      videoCount: channel.video_count?.text || '',
      isVerified: channel.author.is_verified || false
    };
  };

  const videoAsAtLeastMinViews = (video: YTNodes.Video, minViews: number): boolean => {
    // Apply minimum views filter if set
    const viewCountText = video.view_count?.text || '0';
    const viewCount = parseInt(viewCountText.replace(/[^0-9]/g, ''), 10) || 0;
    return viewCount >= minViews;
  };

  function parseVideoDuration(duration: string): number {
    if (duration.match(/^\d+:\d+:\d+$/)) {
      const [hours, minutes, seconds] = duration.split(':').map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    } else if (duration.match(/^\d+:\d+$/)) {
      const [minutes, seconds] = duration.split(':').map(Number);
      return minutes * 60 + seconds;
    } else if (duration.match(/^\d+$/)) {
      return parseInt(duration, 10);
    } else {
      console.log('Invalid duration format:', duration);
      return 0;
    }
  }

  function applyFilters(video: YouTubeVideoSearchResult, filters: YouTubeChannelParams['filters']): boolean {
    if (!filters) {
      return true;
    }
    if (filters['duration'] && filters['duration'] === 'long') {
      // console.log('Applying long duration filter', video.duration, parseVideoDuration(video.duration));
      const durationInSeconds = parseVideoDuration(video.duration);
      return durationInSeconds >= 60 * 30; // 30 minutes
    }
    return true;
  }

  return {
    async searchVideos(
      params: YouTubeSearchParams
    ): Promise<YouTubeApiResponse<YouTubeVideoSearchResult[]>> {
      try {
        // console.log('Search parameters:', params);
        const { query, minViews = 0, pageNumber = 1 } = params;
        
        const youtube = await getInnertube();
        
        // Prepare search options with filters
        const searchOptions: Types.SearchFilters = {
          type: 'video',
          sort_by: params.sortBy,
          upload_date: params.upload_date,
          duration: params.duration,
          features: params.features
        };
        
        // Add additional filters if provided
        if (params.upload_date && params.upload_date !== 'all') {
          searchOptions.upload_date = params.upload_date;
        }
        
        if (params.type && params.type !== 'all') {
          searchOptions.type = params.type;
        }
        
        if (params.duration && params.duration !== 'all') {
          searchOptions.duration = params.duration;
        }
        
        if (params.features && params.features.length > 0) {
          searchOptions.features = params.features;
        }
        
        console.log('Search options:', searchOptions);
        
        // Always perform the initial search
        let searchResults = await youtube.search(query, searchOptions);
        
        // If we need a page beyond the first one, use continuation to navigate to it
        if (pageNumber > 1) {
          console.log(`Navigating to page ${pageNumber}...`);
          
          // Navigate to the requested page by calling getContinuation multiple times
          for (let i = 2; i <= pageNumber; i++) {
            console.log(`Getting page ${i} of search results...`);
            searchResults = await searchResults.getContinuation();
          }
        }
        
        // Transform results to our format
        const videos: YouTubeVideoSearchResult[] = [];
        const filteredVideos: YouTubeVideoSearchResult[] = [];
        
        for (const result of searchResults.results) {
          if (result.type === 'Video') {
            // Check if the video matches the search query
            if (
              ((result as YTNodes.Video).title.text?.toLowerCase().includes(query.toLowerCase()) ||
               (result as YTNodes.Video).description_snippet?.text?.toLowerCase().includes(query.toLowerCase()) ||
               (result as YTNodes.Video).author.name?.toLowerCase().includes(query.toLowerCase())) &&
              videoAsAtLeastMinViews(result as YTNodes.Video, minViews)
            ) {
              videos.push(transformVideoResult(result as YTNodes.Video))
            } else {
              filteredVideos.push(transformVideoResult(result as YTNodes.Video))
            }
          }
        }
          
        // Check if there are more pages available
        const hasMorePages = typeof searchResults.getContinuation === 'function';
          
        const response: YouTubeApiResponse<YouTubeVideoSearchResult[]> = {
          data: videos,
          filteredVideos,
          continuation: hasMorePages ? true : false,
          estimatedResults: searchResults.estimated_results
        };
          
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
      
    async searchChannels(
      params: YouTubeChannelSearchParams
    ): Promise<YouTubeApiResponse<YouTubeChannelSearchResult[]>> {
      try {
        const { query } = params;
        
        const youtube = await getInnertube();
        
        // Search for channels
        const searchResults = await youtube.search(query, {
          type: 'channel'
        });

        // Transform results to our format
        const channels: YouTubeChannelSearchResult[] = [];
        
        for (const result of searchResults.results) {
          if (result.type === 'Channel') {
            const item = transformChannelResult(result as YTNodes.Channel)
            if (item.isVerified && item.title.toLowerCase().includes(query.toLowerCase())) {
              channels.push(item);
            }
          }
        }
        
        const response: YouTubeApiResponse<YouTubeChannelSearchResult[]> = {
          data: channels,
        };
        
        return response;
      } catch (error) {
        console.error('Error searching YouTube channels:', error);
        return {
          error: {
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            code: 'YOUTUBE_CHANNEL_SEARCH_ERROR',
          },
        };
      }
    },
      
    async getVideoDetails(
      params: YouTubeVideoParams
    ): Promise<YouTubeApiResponse<YouTubeVideoDetails>> {
      try {
        const { videoId } = params;
        
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
    ): Promise<YouTubeChannelResponse> {
      try {
        const { channelId, filters, pageNumber } = params;

        console.log({filters});
        
        
        console.log('Getting videos for channel:', channelId);
        
        const youtube = await getInnertube();

        console.log('channelId:', channelId);
        
        // Get channel info
        const channel = await youtube.getChannel(channelId);

        // console.log('channel:', channel);
      
        
        // Extract channel information directly from channel metadata
        const channelInfo: YouTubeChannelInfo = {
          id: channelId,
          title: channel.metadata?.title || '',
          description: channel.metadata?.description || '',
          thumbnailUrl: channel.metadata?.avatar?.[0]?.url || channel.metadata?.thumbnail?.[0]?.url || '',
          subscriberCount: '',
          videoCount: '',
          isVerified: false
        };
        
        // console.log('Channel info:', channelInfo);
        
        // Get channel videos
        async function getVideos() {
          const channelVideos = await channel.getVideos();
          let currentVideos = channelVideos.videos;
          let hasContinuation = channelVideos.has_continuation;
          
          // If we need a page beyond the first one, use continuation to navigate to it
          if (pageNumber && pageNumber > 1) {
            console.log(`Navigating to page ${pageNumber}...`);
          
            // Navigate to the requested page by calling getContinuation multiple times
            for (let i = 2; i <= pageNumber; i++) {
              if (hasContinuation) {
                const continuation = await channelVideos.getContinuation();
                currentVideos = continuation.videos;
                hasContinuation = continuation.has_continuation;
              } else {
                break;
              }
            }
          }

          return {
            videos: currentVideos,
            hasContinuation: hasContinuation
          };
        }

        const { videos: channelVideos, hasContinuation } = await getVideos();
        
        

        // console.log('channelVideos:', channelVideos.videos);
        // channelVideos.applyFilter();
        
        // console.log('Channel videos count:', channelVideos.videos.length);
        
        // Transform results to our format
        const videos: YouTubeVideoSearchResult[] = [];
        
        for (const video of channelVideos) {
          if (video.type === 'Video') {
            const videoResult = transformVideoResult(video as YTNodes.Video);
            
            // Ensure channel info is properly set if missing
            if (!videoResult.channelTitle && channelInfo.title) {
              videoResult.channelTitle = channelInfo.title;
            }
            
            if (!videoResult.channelId) {
              videoResult.channelId = channelId;
            }

            if (applyFilters(videoResult, filters)) {
              videos.push(videoResult);
            }
          }
        }

        const sortedVideos = videos.sort((a, b) => {
          const sortBy = filters?.sort_by || 'upload_date';
          if (sortBy === 'upload_date') {
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
          }
          if (sortBy === 'view_count') {
            const viewCountA = Number(a.viewCount.replace(/,/g, '').replace(' views', ''));
            const viewCountB = Number(b.viewCount.replace(/,/g, '').replace(' views', ''));
            return viewCountB - viewCountA;
          }
          return 0;
        });
        
        // // If we have no videos but the channel exists, try to get videos from the channel's home tab
        // if (videos.length === 0 && channelInfo.title) {
        //   try {
        //     const homeTab = await channel.getHome();
        //     console.log('Getting videos from home tab');
            
        //     // Process videos from home tab
        //     if (homeTab && typeof homeTab === 'object') {
        //       // Try to process videos from contents
        //       if ('contents' in homeTab && Array.isArray(homeTab.contents)) {
        //         for (const item of homeTab.contents) {
        //           if (item && typeof item === 'object' && 'type' in item && item.type === 'Video') {
        //             const videoResult = transformVideoResult(item as YTNodes.Video);
        //             if (!videoResult.channelTitle && channelInfo.title) {
        //               videoResult.channelTitle = channelInfo.title;
        //             }
        //             if (!videoResult.channelId) {
        //               videoResult.channelId = channelId;
        //             }
        //             videos.push(videoResult);
        //           }
        //         }
        //       }
              
        //       // Try to process videos from sections
        //       if ('sections' in homeTab && Array.isArray(homeTab.sections)) {
        //         for (const section of homeTab.sections) {
        //           if (section && typeof section === 'object' && 'contents' in section && Array.isArray(section.contents)) {
        //             for (const item of section.contents) {
        //               if (item && typeof item === 'object' && 'type' in item && item.type === 'Video') {
        //                 const videoResult = transformVideoResult(item as YTNodes.Video);
        //                 if (!videoResult.channelTitle && channelInfo.title) {
        //                   videoResult.channelTitle = channelInfo.title;
        //                 }
        //                 if (!videoResult.channelId) {
        //                   videoResult.channelId = channelId;
        //                 }
        //                 videos.push(videoResult);
        //               }
        //             }
        //           }
        //         }
        //       }
        //     }
        //   } catch (homeError) {
        //     console.error('Error getting channel home tab:', homeError);
        //   }
        // }
        
        return {
          data: {
            videos: sortedVideos,
            channelInfo: channelInfo,
            continuation: hasContinuation,
            estimatedResults: channelVideos.length
          }
        }
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
