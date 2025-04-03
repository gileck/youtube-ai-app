import {
  Box,
  Typography,
  Stack,
  Paper
} from '@mui/material';
import { YouTubeVideoSearchResult } from '../../../server/youtube/types';
import { VideoCard } from './VideoCard';

interface SearchResultsProps {
  searchQuery: string | undefined;
  isSearching: boolean;
  searchResults: YouTubeVideoSearchResult[];
  error: string | null;
  formatDuration: (duration: string) => string;
  formatViewCount: (viewCount: string) => string;
}

export const SearchResults = ({
  searchQuery,
  isSearching,
  searchResults,
  error,
  formatDuration,
  formatViewCount
}: SearchResultsProps) => {
  if (error) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          bgcolor: 'error.light', 
          color: 'error.contrastText',
          borderRadius: 2
        }}
      >
        <Typography variant="body1">{error}</Typography>
      </Paper>
    );
  }

  if (searchQuery && !isSearching && searchResults.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>No results found</Typography>
        <Typography variant="body1" color="text.secondary">
          Try different keywords or check your spelling
        </Typography>
      </Box>
    );
  }

  if (searchResults.length === 0) {
    return null;
  }

  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Search results for &ldquo;{searchQuery}&rdquo;
      </Typography>
      
      <Stack spacing={3}>
        {searchResults.map((video) => (
          <Box key={video.id}>
            <VideoCard 
              video={video} 
              formatDuration={formatDuration} 
              formatViewCount={formatViewCount} 
            />
          </Box>
        ))}
      </Stack>
    </>
  );
};
