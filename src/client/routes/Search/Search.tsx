import { useState, useEffect, useCallback } from 'react';
import { Box, Container, CircularProgress, Button, Tooltip, Typography, Paper, List, ListItem, ListItemText, ListItemButton, IconButton } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from '../../router';
import { searchYouTubeVideos } from '../../../apis/youtube/client';
import { YouTubeVideoSearchResult, YouTubeChannelSearchResult } from '@/shared/types/youtube';
import { 
  SearchForm, 
  SearchResults,
  FilterDialog
} from '../../components/youtube/search';
import { YouTubeSearchFilters } from '../../../apis/youtube/types';

// Local storage keys
const FILTERS_STORAGE_KEY = 'youtube_search_filters';
const RECENT_SEARCHES_KEY = 'youtube_recent_searches';
const MAX_RECENT_SEARCHES = 10;

// RecentSearches component
const RecentSearches = ({ 
  searches, 
  onSearchSelect, 
  onDeleteSearch 
}: { 
  searches: string[], 
  onSearchSelect: (query: string) => void,
  onDeleteSearch: (query: string) => void
}) => {
  if (searches.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">No recent searches</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ mt: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <HistoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="h6">Recent Searches</Typography>
      </Box>
      <List sx={{ p: 0 }}>
        {searches.map((query) => (
          <ListItem 
            key={query}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => onDeleteSearch(query)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            }
            disablePadding
            divider
          >
            <ListItemButton onClick={() => onSearchSelect(query)}>
              <SearchIcon sx={{ mr: 2, color: 'text.secondary', fontSize: 20 }} />
              <ListItemText primary={query} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

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
  
  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse saved recent searches', e);
      return [];
    }
  });
  
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
      duration: 'long',
      sort_by: 'upload_date',
      features: [],
      minimum_views: 1000
    };
  });

  // Save search query to recent searches
  const saveRecentSearch = useCallback((query: string) => {
    if (!query || query.trim() === '') return;
    
    setRecentSearches(prev => {
      // Remove the query if it already exists (to bring it to top)
      const filtered = prev.filter(q => q !== query);
      // Add the new query at the beginning and limit to MAX_RECENT_SEARCHES
      const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      
      // Save to localStorage
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      
      return updated;
    });
  }, []);

  // Delete a search from recent searches
  const handleDeleteSearch = useCallback((query: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(q => q !== query);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Define performSearch as useCallback to avoid dependency issues
  const performSearch = useCallback(async (query: string, page?: number) => {
    if (!page || page === 1) {
      // New search
      setIsSearching(true);
      setError(null);
      setCurrentPage(1);
      
      // Save to recent searches
      saveRecentSearch(query);
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
  }, [filters, saveRecentSearch]);

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
    // Clear search results when clearing the search
    setSearchResults([]);
    setChannelResults([]);
    // Update URL to remove query parameter
    navigate('/search', { replace: true });
  };

  const handleRecentSearchSelect = (query: string) => {
    setSearchQuery(query);
    navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
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

  // Determine if we should show recent searches
  const shouldShowRecentSearches = !isSearching && searchResults.length === 0 && 
    channelResults.length === 0 && !queryParams.q;

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
        ) : shouldShowRecentSearches ? (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ mt: 4, mb: 1 }}>
              Start searching for YouTube videos
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Enter keywords in the search bar above
            </Typography>
            <Container maxWidth="sm">
              <RecentSearches 
                searches={recentSearches} 
                onSearchSelect={handleRecentSearchSelect}
                onDeleteSearch={handleDeleteSearch}
              />
            </Container>
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
