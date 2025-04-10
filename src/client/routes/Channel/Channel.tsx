import { useState, useEffect, useCallback } from 'react';
import { Box, Container, CircularProgress, Button, Tooltip, Typography, Avatar } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useRouter } from '../../router';
import { getYouTubeChannelVideos } from '../../../apis/youtube/client';
import { YouTubeVideoSearchResult, YouTubeChannelInfo } from '../../../apis/youtube/types';
import { 
  SearchResults, 
  SearchForm,
  FilterDialog
} from '../../components/youtube/search';
import { YouTubeSearchFilters } from '../../../apis/youtube/types';

// Local storage key for filters
const FILTERS_STORAGE_KEY = 'youtube_channel_filters';

export const Channel = () => {
  const { routeParams } = useRouter();
  const channelId = routeParams.id || '';
  
  // const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [channelVideos, setChannelVideos] = useState<YouTubeVideoSearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);  
  const [estimatedResults, setEstimatedResults] = useState<number | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  console.log({channelVideos});
  // const [filteredVideos, setFilteredVideos] = useState<YouTubeVideoSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [channelInfo, setChannelInfo] = useState<YouTubeChannelInfo | null>(null);
  
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
      sort_by: 'view_count',
      features: []
    };
  });

  // Define loadChannelVideos as useCallback to avoid dependency issues
  const loadChannelVideos = useCallback(async (page?: number) => {
    console.log('Loading channel videos...', {page});
    if (!channelId) return;

    if (!page || page === 1) {
      // New search
      setIsLoading(true);
      setError(null);
      setCurrentPage(1);
    } else {
      // Loading more results
      setIsLoadingMore(true);
    }
    
    try {
      const {data: {error, data}} = await getYouTubeChannelVideos({ channelId, filters, pageNumber: page });
      
      if (error) {
        setError(error.message);
        setChannelVideos([]);
      } else if (data?.videos && data.videos.length > 0) {
        if (page && page > 1) {
          // Append new videos to existing list when loading more
          setChannelVideos(prevVideos => [...prevVideos, ...data.videos]);
        } else {
          // Replace videos for initial load
          setChannelVideos(data.videos);
        }
        setChannelInfo(data.channelInfo || null);
        setHasMoreResults(data.continuation || false);
        setEstimatedResults(data.estimatedResults);
      } else {
        setError('No videos found for this channel.');
        setChannelVideos([]);
      }
    } catch (err) {
      setError('An error occurred while loading channel videos. Please try again.');
      console.error('Channel videos error:', err);
      setChannelVideos([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [channelId, filters]);

  // Load channel videos when channelId changes
  useEffect(() => {
    if (channelId) {
      loadChannelVideos(currentPage);
    }
  }, [channelId, currentPage]);

  function onLoadMore() {
    setCurrentPage(currentPage + 1);
  }

  // Apply filters when search query or filters change

  

  // const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(event.target.value);
  // };

  // const handleSearchSubmit = (event: React.FormEvent) => {
  //   event.preventDefault();
  //   // Just apply the search filter - no need to reload from API
  //   if (allChannelVideos.length > 0) {
  //     applyFilters(allChannelVideos);
  //   }
  // };

  // const handleClearSearch = () => {
  //   setSearchQuery('');
  // };

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
    
    // Apply filters to current videos
    setFilters(newFilters);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', p: 0 }}>
      {/* Channel Header */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: 1, 
        borderColor: 'divider',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {channelInfo?.thumbnailUrl ? (
          <Avatar 
            src={channelInfo.thumbnailUrl} 
            alt={channelInfo.title || 'Channel'}
            sx={{ width: 80, height: 80, mb: 1 }}
          />
        ) : (
          <Avatar 
            sx={{ width: 80, height: 80, mb: 1, bgcolor: 'primary.main' }}
          >
            {channelInfo?.title?.charAt(0) || 'C'}
          </Avatar>
        )}
        <Typography variant="h5" component="h1" gutterBottom>
          {channelInfo?.title || 'Channel Videos'}
        </Typography>
        {isLoading ? (
          <CircularProgress size={24} sx={{ my: 1 }} />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {channelInfo?.subscriberCount && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {channelInfo.subscriberCount}
              </Typography>
            )}
          </Box>
        )}
      </Box>
      
      {/* Search Form */}
      {/* <SearchForm
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        placeholder="Search within channel..."
      /> */}
      
      {/* Filters Button */}
      <Box sx={{ 
        alignItems: 'center', 
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Tooltip title="Advanced Filters">
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
        {isLoading && channelVideos.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <SearchResults
            title={`${channelInfo?.title || 'Channel'} Videos`}
            isSearching={isLoading}
            searchResults={channelVideos}
            filteredVideos={[]}
            error={error}
            hasMoreResults={hasMoreResults}
            estimatedResults={estimatedResults}
            onLoadMore={onLoadMore}
            isLoadingMore={isLoadingMore}
          />
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
