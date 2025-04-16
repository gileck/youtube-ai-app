import {
  Box,
  Typography,
  Paper,
  Divider,
  Collapse,
  IconButton,
  Button,
  Chip,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { YouTubeVideoSearchResult, YouTubeChannelSearchResult } from '@/shared/types/youtube';
import { VideoCard } from './VideoCard';
import { ChannelCard } from './ChannelCard';
import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { formatDuration, formatViewCount } from './utils';

interface SearchResultsProps {
  title?: string;
  searchQuery?: string;
  isSearching: boolean;
  searchResults: YouTubeVideoSearchResult[];
  filteredVideos?: YouTubeVideoSearchResult[];
  channelResults?: YouTubeChannelSearchResult[];
  error: string | null;
  hasMoreResults?: boolean;
  estimatedResults?: number;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export const SearchResults = ({
  title,
  searchQuery,
  isSearching,
  searchResults,
  channelResults = [],
  error,
  filteredVideos = [],
  hasMoreResults = false,
  estimatedResults,
  onLoadMore,
  isLoadingMore = false
}: SearchResultsProps) => {

  const [showFilteredVideos, setShowFilteredVideos] = useState(false);

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

    if (!isSearching && searchResults.length === 0 && channelResults.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>No results found</Typography>
        <Typography variant="body1" color="text.secondary">
          {searchQuery ? 'Try different keywords or check your spelling' : 'No videos available'}
        </Typography>
      </Box>
    );
  }

  if (searchResults.length === 0 && channelResults.length === 0 && isSearching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Format the estimated results count
  const formatEstimatedResults = (count?: number): string => {
    if (!count) return '';
    
    if (count >= 1000000) {
      return `${Math.floor(count / 1000000)}M+`;
    } else if (count >= 1000) {
      return `${Math.floor(count / 1000)}K+`;
    }
    
    return `${count}+`;
  };
  
  return (
    <Box sx={{ mt: 2 }}>
      
      {(title || searchQuery) && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 1, 
          flexDirection: 'column',
          gap: 2
        }}>
          <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            {title ? title : (
              searchQuery ? `About ${formatEstimatedResults(estimatedResults) || searchResults.length + channelResults.length} results for "${searchQuery}"` : ''
            )}
          </Typography>
        </Box>
      )}
      
      <Divider sx={{ mb: 2 }} />
      
      {/* Display verified channels at the top */}
      {channelResults.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {channelResults.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </Box>
      )}
      
      {/* Display video results */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        margin: -1 // Negative margin to counteract padding of children
      }}>
        {searchResults.map((video) => (
          <Box 
            key={video.id} 
            sx={{ 
              width: { 
                xs: '100%', 
                sm: '50%', 
                md: '33.333%', 
                lg: '25%' 
              }, 
              paddingLeft: 1,
              paddingRight: 1
            }}
          >
            <VideoCard 
              video={video} 
              formatDuration={formatDuration} 
              formatViewCount={formatViewCount} 
            />
            <Divider sx={{ my: 1 }} />
          </Box>
        ))}
      </Box>
      
      {/* Load More Button */}
      {hasMoreResults && onLoadMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            startIcon={isLoadingMore ? <CircularProgress size={20} /> : <MoreHorizIcon />}
            sx={{ 
              borderRadius: 28,
              px: 4,
              py: 1
            }}
          >
            {isLoadingMore ? 'Loading...' : 'Load More Results'}
          </Button>
        </Box>
      )}
      
      <Divider sx={{ my: 0 }} />
      
      {/* Display filtered videos */}
      {filteredVideos.length > 0 && (
        <Box sx={{ mt: 4, mb: 3 }}>
          <Card 
            variant="outlined" 
            sx={{ 
              borderRadius: 2,
              borderColor: 'divider',
              boxShadow: 'none',
              bgcolor: 'background.paper',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ pb: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    Filtered Videos
                  </Typography>
                  <Chip 
                    label={`${filteredVideos.length}`} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 1 }}
                  />
                </Box>
                <IconButton
                  onClick={() => setShowFilteredVideos(!showFilteredVideos)}
                  sx={{
                    transform: showFilteredVideos ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s'
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                These videos matched your filters but may not be directly relevant to your search query.
              </Typography>
            </CardContent>
            
            <Collapse in={showFilteredVideos}>
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  margin: -1
                }}>
                  {filteredVideos.map((video) => (
                    <Box 
                      key={video.id} 
                      sx={{ 
                        width: { 
                          xs: '100%', 
                          sm: '50%', 
                          md: '33.333%', 
                          lg: '25%' 
                        }, 
                        paddingLeft: 1,
                        paddingRight: 1
                      }}
                    >
                      <VideoCard 
                        video={video} 
                        formatDuration={formatDuration} 
                        formatViewCount={formatViewCount} 
                      />
                      <Divider sx={{ my: 1 }} />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Collapse>
          </Card>
        </Box>
      )}
    </Box>
  );
};
