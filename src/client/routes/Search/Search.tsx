import { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import { useRouter } from '../../router';
import { searchYouTubeVideos } from '../../../apis/youtube/client';
import { YouTubeVideoSearchResult } from '../../../server/youtube/types';
import { SearchForm } from './SearchForm';
import { SearchResults } from './SearchResults';
import { formatDuration, formatViewCount } from './utils';

export const Search = () => {
  const { queryParams, navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState(queryParams.q || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<YouTubeVideoSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Perform search when query param changes
  useEffect(() => {
    if (queryParams.q && queryParams.q.trim() !== '') {
      performSearch(queryParams.q);
    }
  }, [queryParams.q]);

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

  const performSearch = async (query: string) => {
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await searchYouTubeVideos({ query, maxResults: 20 });
      
      if (response.data.error) {
        setError(response.data.error.message);
        setSearchResults([]);
      } else if (response.data.videos && response.data.videos.length > 0) {
        setSearchResults(response.data.videos);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SearchForm
        searchQuery={searchQuery}
        isSearching={isSearching}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
      />
      
      <SearchResults
        searchQuery={queryParams.q}
        isSearching={isSearching}
        searchResults={searchResults}
        error={error}
        formatDuration={formatDuration}
        formatViewCount={formatViewCount}
      />
    </Container>
  );
};
