import { useState, useEffect, useCallback } from 'react';
import { Box, Container, CircularProgress, Button, Tooltip, Typography, Pagination } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getYouTubeChannelVideos } from '../../../apis/youtube/client';
import { 
  YouTubeVideoSearchResult, 
  YouTubeSearchFilters 
} from '../../../apis/youtube/types';
import { 
  SearchResults, 
  FilterDialog 
} from '../../components/youtube/search';
import { 
  getBookmarkedChannels, 
  BookmarkedChannel 
} from '../../utils/bookmarksStorage';

// Local storage key for filters
const FILTERS_STORAGE_KEY = 'youtube_feed_filters';
// Number of videos per page
const VIDEOS_PER_PAGE = 20;

// Helper function to convert relative date string to timestamp
const getDateFromRelativeTime = (relativeTime: string): number => {
  const now = new Date();
  
  // Handle ISO date strings (they might be returned in some cases)
  if (relativeTime.match(/^\d{4}-\d{2}-\d{2}T/)) {
    return new Date(relativeTime).getTime();
  }
  
  // Handle relative time strings
  const minutesMatch = relativeTime.match(/(\d+)\s+minute(s)?\s+ago/);
  if (minutesMatch) {
    const minutes = parseInt(minutesMatch[1], 10);
    return new Date(now.getTime() - minutes * 60 * 1000).getTime();
  }
  
  const hoursMatch = relativeTime.match(/(\d+)\s+hour(s)?\s+ago/);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1], 10);
    return new Date(now.getTime() - hours * 60 * 60 * 1000).getTime();
  }
  
  const daysMatch = relativeTime.match(/(\d+)\s+day(s)?\s+ago/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).getTime();
  }
  
  const weeksMatch = relativeTime.match(/(\d+)\s+week(s)?\s+ago/);
  if (weeksMatch) {
    const weeks = parseInt(weeksMatch[1], 10);
    return new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000).getTime();
  }
  
  const monthsMatch = relativeTime.match(/(\d+)\s+month(s)?\s+ago/);
  if (monthsMatch) {
    const months = parseInt(monthsMatch[1], 10);
    const date = new Date(now);
    date.setMonth(date.getMonth() - months);
    return date.getTime();
  }
  
  const yearsMatch = relativeTime.match(/(\d+)\s+year(s)?\s+ago/);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1], 10);
    const date = new Date(now);
    date.setFullYear(date.getFullYear() - years);
    return date.getTime();
  }
  
  // Handle specific formats like "Jan 1, 2023"
  const specificDateMatch = relativeTime.match(/([A-Za-z]+)\s+(\d+),\s+(\d{4})/);
  if (specificDateMatch) {
    const [month, day, year] = specificDateMatch;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.findIndex(m => m.toLowerCase() === month.toLowerCase());
    if (monthIndex !== -1) {
      return new Date(parseInt(year), monthIndex, parseInt(day)).getTime();
    }
  }
  
  // Default to current time if format is not recognized
  console.warn(`Unrecognized date format: ${relativeTime}`);
  return now.getTime();
};

export const VideoFeed = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [feedVideos, setFeedVideos] = useState<YouTubeVideoSearchResult[]>([]);
  const [displayedVideos, setDisplayedVideos] = useState<YouTubeVideoSearchResult[]>([]);
  const [bookmarkedChannels, setBookmarkedChannels] = useState<BookmarkedChannel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter dialog state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  // Advanced filters state
  const [filters, setFilters] = useState<YouTubeSearchFilters>(() => {
    // Try to get filters from local storage
    const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        return parsedFilters;
      } catch (e) {
        console.error('Failed to parse saved filters', e);
      }
    }
    // Default filters
    return {
      upload_date: 'all',
      type: 'video',
      duration: 'all',
      sort_by: 'upload_date', // Default to most recent videos
      features: [],
      minViews: 0
    };
  });

  // Load bookmarked channels
  useEffect(() => {
    const channels = getBookmarkedChannels();
    setBookmarkedChannels(channels);
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
    
    const allVideos: YouTubeVideoSearchResult[] = [];
    let completedChannels = 0;

    try {
      // Create an array of promises to fetch videos from all channels in parallel
      const channelPromises = bookmarkedChannels.map(async (channel) => {
        try {
          const { data: { error, data } } = await getYouTubeChannelVideos({ 
            channelId: channel.id, 
            filters,
            pageNumber: 1 // Just get the first page for each channel
          });
          
          // Update progress after each channel completes
          completedChannels++;
          setLoadingProgress(Math.round((completedChannels / bookmarkedChannels.length) * 100));
          
          if (error) {
            console.error(`Error loading videos for channel ${channel.id}:`, error);
            return [];
          } else if (data?.videos && data.videos.length > 0) {
            // Add channel info to videos for display
            return data.videos.map(video => ({
              ...video,
              channelTitle: data.channelInfo?.title || channel.title || 'Unknown Channel'
            }));
          }
          return [];
        } catch (err) {
          console.error(`Error loading videos for channel ${channel.id}:`, err);
          completedChannels++;
          setLoadingProgress(Math.round((completedChannels / bookmarkedChannels.length) * 100));
          return [];
        }
      });
      
      // Wait for all channel requests to complete
      const channelVideosArrays = await Promise.all(channelPromises);
      
      // Flatten the array of arrays into a single array of videos
      channelVideosArrays.forEach(videos => {
        if (videos.length > 0) {
          allVideos.push(...videos);
        }
      });

      // Sort videos based on filters
      const sortedVideos = sortVideos(allVideos, filters.sort_by);
      
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

  // Sort videos based on selected sort option
  const sortVideos = (videos: YouTubeVideoSearchResult[], sortBy: string = 'upload_date') => {
    return [...videos].sort((a, b) => {
      if (sortBy === 'upload_date') {
        // Convert published date strings to actual timestamps using our helper function
        const dateA = getDateFromRelativeTime(a.publishedAt);
        const dateB = getDateFromRelativeTime(b.publishedAt);
        return dateB - dateA; // Most recent first
      } else if (sortBy === 'view_count') {
        // Sort by view count (highest first)
        const viewsA = parseInt(a.viewCount || '0', 10);
        const viewsB = parseInt(b.viewCount || '0', 10);
        return viewsB - viewsA;
      }
      return 0;
    });
  };

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load videos when bookmarked channels change or when filters change
  useEffect(() => {
    if (bookmarkedChannels.length > 0) {
      loadChannelVideos();
    }
  }, [bookmarkedChannels, loadChannelVideos]);

  // Handle filter dialog open
  const handleOpenFilterDialog = () => {
    setIsFilterDialogOpen(true);
  };
  
  // Handle filter dialog close
  const handleCloseFilterDialog = () => {
    setIsFilterDialogOpen(false);
  };
  
  // Handle applying filters
  const handleApplyFilters = (newFilters: YouTubeSearchFilters) => {
    setFilters(newFilters);
    
    // Save to local storage
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
    
    // Apply filters and reset to first page
    setCurrentPage(1);
    
    // Re-sort videos with new filters
    const sortedVideos = sortVideos(feedVideos, newFilters.sort_by);
    setFeedVideos(sortedVideos);
    
    // Update displayed videos
    setDisplayedVideos(sortedVideos.slice(0, VIDEOS_PER_PAGE));
  };

  // Set up event listener for bookmark changes
  useEffect(() => {
    // Custom event for bookmark changes within the same window
    const handleBookmarkChange = () => {
      const channels = getBookmarkedChannels();
      setBookmarkedChannels(channels);
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

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      p: 0 
    }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: 1, 
        borderColor: 'divider',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Video Feed
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Videos from your {bookmarkedChannels.length} bookmarked channels
        </Typography>
      </Box>
      
      {/* Filters Button */}
      <Box sx={{ 
        alignItems: 'center', 
        display: 'flex',
        flexDirection: 'column',
        mt: 2
      }}>
        <Tooltip title="Sort and Filter">
          <Button
            color="primary"
            startIcon={<FilterListIcon />}
            onClick={handleOpenFilterDialog}
            sx={{ minWidth: 'auto', height: 40 }}
          >
            Filters
          </Button>
        </Tooltip>
      </Box>
      
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flex: 1, p: 0 }}>
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            my: 4 
          }}>
            <CircularProgress variant="determinate" value={loadingProgress} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading videos from {bookmarkedChannels.length} channels... ({loadingProgress}%)
            </Typography>
          </Box>
        ) : (
          <>
            <SearchResults
              title={`Videos from Your Bookmarked Channels (${feedVideos.length})`}
              isSearching={isLoading}
              searchResults={displayedVideos}
              filteredVideos={[]}
              error={error}
              hasMoreResults={false}
              onLoadMore={undefined}
              isLoadingMore={false}
            />
            
            {/* Pagination */}
            {feedVideos.length > VIDEOS_PER_PAGE && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                my: 4 
              }}>
                <Pagination 
                  count={totalPages} 
                  page={currentPage} 
                  onChange={handlePageChange} 
                  color="primary" 
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Container>
      
      {/* Filter Dialog */}
      <FilterDialog
        open={isFilterDialogOpen}
        onClose={handleCloseFilterDialog}
        initialFilters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </Box>
  );
};
