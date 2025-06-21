import { useState, useEffect, useCallback } from 'react';
import { getYouTubeChannelVideos, searchYouTubeVideos } from '../../../../apis/youtube/client';
import { YouTubeSearchFilters, YouTubeSearchRequest } from '../../../../apis/youtube/types';
import { BookmarkedChannel, getBookmarkedChannels } from '../../../utils/bookmarksApi';
import { YouTubeVideoSearchResult } from '@/shared/types/youtube';
import { sortVideos, VIDEOS_PER_PAGE } from '../utils';

export interface VideoLoaderResult {
  isLoading: boolean;
  loadingProgress: number;
  feedVideos: YouTubeVideoSearchResult[];
  displayedVideos: YouTubeVideoSearchResult[];
  bookmarkedChannels: BookmarkedChannel[];
  error: string | null;
  currentPage: number;
  totalPages: number;
  loadChannelVideos: () => Promise<void>;
  setCurrentPage: (page: number) => void;
}

export const useVideoLoader = (filters: YouTubeSearchFilters, isFiltersLoading: boolean): VideoLoaderResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [feedVideos, setFeedVideos] = useState<YouTubeVideoSearchResult[]>([]);
  const [displayedVideos, setDisplayedVideos] = useState<YouTubeVideoSearchResult[]>([]);
  const [bookmarkedChannels, setBookmarkedChannels] = useState<BookmarkedChannel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load bookmarked channels
  useEffect(() => {
    const loadChannels = async () => {
      try {
        const channels = await getBookmarkedChannels();
        setBookmarkedChannels(channels);
      } catch (error) {
        console.error('Error loading bookmarked channels:', error);
      }
    };
    
    loadChannels();
  }, []);

  // Update displayed videos when page changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
    const endIndex = startIndex + VIDEOS_PER_PAGE;
    setDisplayedVideos(feedVideos.slice(startIndex, endIndex));
  }, [currentPage, feedVideos]);

  // Load videos from all bookmarked channels
  const loadChannelVideos = useCallback(async () => {
    if (bookmarkedChannels.length === 0) {
      setError('No bookmarked channels found. Please bookmark some channels to see their videos.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setFeedVideos([]);
    setDisplayedVideos([]);
    setLoadingProgress(0);
    setCurrentPage(1);
    
    let completedRequests = 0;
    const totalRequests = bookmarkedChannels.length * 2; // Each channel has 2 operations (get channel videos + search by name)

    try {
      // Create a flat array of all promises (both channel videos and search results)
      const allPromises: Promise<{
        type: 'channel' | 'search';
        channelId: string;
        channelTitle: string;
        videos: YouTubeVideoSearchResult[];
      }>[] = [];
      
      // Add all requests to the promises array
      bookmarkedChannels.forEach(channel => {
        // 1. Add channel videos request
        allPromises.push(
          getYouTubeChannelVideos({ 
            channelId: channel.id, 
            filters,
            pageNumber: 1
          })
          .then(({ data: channelData }) => {
            // Update progress after each request completes
            completedRequests++;
            setLoadingProgress(Math.round((completedRequests / totalRequests) * 100));
            
            const videos = !channelData.error && channelData.data?.videos 
              ? channelData.data.videos.map(video => ({
                  ...video,
                  channelTitle: channelData.data?.channelInfo?.title || channel.title || 'Unknown Channel'
                }))
              : [];
            
            return {
              type: 'channel' as const,
              channelId: channel.id,
              channelTitle: channel.title || '',
              videos
            };
          })
          .catch(err => {
            console.error(`Error loading videos for channel ${channel.id}:`, err);
            completedRequests++;
            setLoadingProgress(Math.round((completedRequests / totalRequests) * 100));
            return {
              type: 'channel' as const,
              channelId: channel.id,
              channelTitle: channel.title || '',
              videos: []
            };
          })
        );
        
        // 2. Add search by channel name request (only if there's a title)
        if (channel.title) {
          const searchRequest: YouTubeSearchRequest = {
            query: channel.title,
            filters,
            pageNumber: 1
          };
          
          allPromises.push(
            searchYouTubeVideos(searchRequest)
            .then(({ data: searchData }) => {
              // Update progress
              completedRequests++;
              setLoadingProgress(Math.round((completedRequests / totalRequests) * 100));
              
              return {
                type: 'search' as const,
                channelId: channel.id,
                channelTitle: channel.title,
                videos: !searchData.error && searchData.videos ? searchData.videos : []
              };
            })
            .catch(err => {
              console.error(`Error searching videos for channel ${channel.title}:`, err);
              completedRequests++;
              setLoadingProgress(Math.round((completedRequests / totalRequests) * 100));
              return {
                type: 'search' as const,
                channelId: channel.id,
                channelTitle: channel.title,
                videos: []
              };
            })
          );
        } else {
          // If no channel title, just count this operation as completed
          completedRequests++;
          setLoadingProgress(Math.round((completedRequests / totalRequests) * 100));
        }
      });
      
      // Wait for all promises to complete in parallel
      const results = await Promise.all(allPromises);
      
      // Flatten results and remove duplicates
      const uniqueVideosMap = new Map<string, YouTubeVideoSearchResult>();
      
      // Process all results
      results.forEach(result => {
        result.videos.forEach(video => {
          if (video.id) {
            uniqueVideosMap.set(video.id, video);
          }
        });
      });
      
      // Convert map back to array
      const uniqueVideos = Array.from(uniqueVideosMap.values());

      // Sort videos based on filters
      const sortedVideos = sortVideos(uniqueVideos, filters.sort_by);
      
      setFeedVideos(sortedVideos);
      
      // Calculate total pages
      const pages = Math.ceil(sortedVideos.length / VIDEOS_PER_PAGE);
      setTotalPages(pages > 0 ? pages : 1);
      
      // Set first page of videos
      setDisplayedVideos(sortedVideos.slice(0, VIDEOS_PER_PAGE));
      
      if (sortedVideos.length === 0) {
        setError('No videos found from your bookmarked channels.');
      }
    } catch (err) {
      setError('An error occurred while loading videos. Please try again.');
      console.error('Video feed error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [bookmarkedChannels, filters]);

  // Load videos when bookmarked channels change and filters are loaded
  useEffect(() => {
    if (bookmarkedChannels.length > 0 && !isFiltersLoading) {
      loadChannelVideos();
    }
  }, [bookmarkedChannels, loadChannelVideos, isFiltersLoading]);

  // Set up event listener for bookmark changes
  useEffect(() => {
    // Custom event for bookmark changes within the same window
    const handleBookmarkChange = async () => {
      try {
        const channels = await getBookmarkedChannels();
        setBookmarkedChannels(channels);
      } catch (error) {
        console.error('Error loading bookmarked channels:', error);
      }
    };
    
    window.addEventListener('bookmarkChange', handleBookmarkChange);
    window.addEventListener('storage', (e) => {
      if (e.key?.includes('youtube-ai-app-bookmarked-channels')) {
        handleBookmarkChange();
      }
    });

    return () => {
      window.removeEventListener('bookmarkChange', handleBookmarkChange);
      window.removeEventListener('storage', handleBookmarkChange);
    };
  }, []);

  return {
    isLoading,
    loadingProgress,
    feedVideos,
    displayedVideos,
    bookmarkedChannels,
    error,
    currentPage,
    totalPages,
    loadChannelVideos,
    setCurrentPage
  };
}; 