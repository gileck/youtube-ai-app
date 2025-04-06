import { useState, useEffect, useCallback } from 'react';
import { Box, Container, CircularProgress, Button, Tooltip } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useRouter } from '../../router';
import { searchYouTubeVideos } from '../../../apis/youtube/client';
import { YouTubeVideoSearchResult, YouTubeChannelSearchResult } from '../../../server/youtube/types';
import { 
  SearchForm, 
  SearchResults,
  FilterDialog
} from '../../components/youtube/search';
import { YouTubeSearchFilters } from '../../../apis/youtube/types';

// Local storage key for filters
const FILTERS_STORAGE_KEY = 'youtube_search_filters';

export const Search = () => {
  const { queryParams, navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState(queryParams.q || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<YouTubeVideoSearchResult[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<YouTubeVideoSearchResult[]>([]);
  const [channelResults, setChannelResults] = useState<YouTubeChannelSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [estimatedResults, setEstimatedResults] = useState<number | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
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

  // Define performSearch as useCallback to avoid dependency issues
  const performSearch = useCallback(async (query: string, page?: number) => {
    if (!page || page === 1) {
      // New search
      setIsSearching(true);
      setError(null);
      setCurrentPage(1);
    } else {
      // Loading more results
      setIsLoadingMore(true);
    }
    
    try {
      const response = await searchYouTubeVideos({ 
        query, 
        filters,
        pageNumber: page
      });
      
      if (response.data.error) {
        setError(response.data.error.message);
        setSearchResults([]);
        setChannelResults([]);
      } else {
        // Set video results
        if (response.data.videos && response.data.videos.length > 0) {
          if (page && page > 1) {
            // Append new results to existing ones
            setSearchResults(prev => [...prev, ...response.data.videos!]);
            setFilteredVideos(prev => [...prev, ...(response.data.filteredVideos || [])]);
          } else {
            // Replace results on new search
            setSearchResults(response.data.videos);
            setFilteredVideos(response.data.filteredVideos || []);
          }
        } else if (!page || page === 1) {
          // Only clear results on new search, not when loading more
          setSearchResults([]);
        }
        
        // Set channel results (only on initial search, not pagination)
        if ((!page || page === 1) && response.data.channels && response.data.channels.length > 0) {
          setChannelResults(response.data.channels);
        } else if (!page || page === 1) {
          setChannelResults([]);
        }
        
        // Check if there are more results available
        setHasMoreResults(response.data.continuation || false);
        
        // Set estimated results count
        if (response.data.estimatedResults) {
          setEstimatedResults(response.data.estimatedResults);
        }
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      console.error('Search error:', err);
      setSearchResults([]);
      setChannelResults([]);
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  }, [filters]);

  // Perform search when query param changes
  useEffect(() => {
    if (queryParams.q) {
      performSearch(queryParams.q);
    }
  }, [queryParams.q, performSearch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim() !== '') {
      // Update URL with search query
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`, { replace: true });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Handle loading more results
  const handleLoadMore = () => {
    if (hasMoreResults && queryParams.q) {
      // Increment the page number for the next batch of results
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      
      // Load the next page of results
      performSearch(queryParams.q, nextPage);
    }
  };

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
    
    // Reset pagination state for new search with updated filters
    setCurrentPage(1);
    setHasMoreResults(false);
    
    if (searchQuery.trim() !== '') {
      performSearch(searchQuery);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', p:0 }}>
      <SearchForm
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
      />
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
      
      <Container maxWidth="lg" sx={{ flex: 1, p: 0 }}>
        {isSearching && searchResults.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <SearchResults
            searchQuery={queryParams.q}
            isSearching={isSearching}
            searchResults={searchResults}
            filteredVideos={filteredVideos}
            channelResults={channelResults}
            error={error}
            hasMoreResults={hasMoreResults}
            estimatedResults={estimatedResults}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
          />
        )}
      </Container>
      
      <FilterDialog
        open={isFilterDialogOpen}
        onClose={handleCloseFilterDialog}
        initialFilters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </Box>
  );
};
