import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Container,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  getBookmarkedVideos, 
  getBookmarkedChannels,
  BookmarkedVideo,
  BookmarkedChannel
} from '../../utils/bookmarksApi';
import { VideoCard } from '../../components/youtube/search/VideoCard';
import { ChannelCard } from '../../components/youtube/search/ChannelCard';
import { formatDuration, formatViewCount } from '../../components/youtube/search/utils';

export const Bookmarks = () => {
  const [bookmarkedVideos, setBookmarkedVideos] = useState<BookmarkedVideo[]>([]);
  const [bookmarkedChannels, setBookmarkedChannels] = useState<BookmarkedChannel[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmall = useMediaQuery('(max-width:400px)');

  // Load bookmarks from API
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const [videos, channels] = await Promise.all([
          getBookmarkedVideos(),
          getBookmarkedChannels()
        ]);
        setBookmarkedVideos(videos);
        setBookmarkedChannels(channels);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    };

    // Load initial bookmarks
    loadBookmarks();
    
    // Custom event for bookmark changes within the same window
    const handleCustomBookmarkChange = () => loadBookmarks();
    window.addEventListener('bookmarkChange', handleCustomBookmarkChange);

    return () => {
      window.removeEventListener('bookmarkChange', handleCustomBookmarkChange);
    };
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: { xs: 2, sm: 3, md: 4 }, 
        mb: { xs: 4, sm: 6, md: 8 },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <Typography 
        variant={isExtraSmall ? "h5" : "h4"} 
        component="h1" 
        gutterBottom
        sx={{ 
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
          mb: { xs: 1, sm: 2 }
        }}
      >
        Your Bookmarks
      </Typography>
      
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        indicatorColor="primary"
        textColor="primary"
        variant={isMobile ? "fullWidth" : "standard"}
        sx={{ 
          mb: { xs: 1.5, sm: 2, md: 3 },
          '& .MuiTab-root': {
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
            minWidth: { xs: 'auto', sm: 80 },
            px: { xs: 1, sm: 2 }
          }
        }}
      >
        <Tab label="ALL" />
        <Tab label={`VIDEOS (${bookmarkedVideos.length})`} />
        <Tab label={`CHANNELS (${bookmarkedChannels.length})`} />
      </Tabs>

      {/* Videos Section */}
      {(activeTab === 0 || activeTab === 1) && (
        <>
          {bookmarkedVideos.length > 0 ? (
            <>
              {activeTab === 0 && (
                <Typography 
                  variant={isExtraSmall ? "h6" : "h5"} 
                  component="h2" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                    mb: { xs: 1, sm: 1.5 }
                  }}
                >
                  Bookmarked Videos
                </Typography>
              )}
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)'
                  },
                  gap: { xs: 1.5, sm: 2, md: 3 },
                  mb: { xs: 2, sm: 3, md: 4 }
                }}
              >
                {bookmarkedVideos
                  .sort((a, b) => b.bookmarkedAt - a.bookmarkedAt)
                  .map(video => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      formatDuration={formatDuration}
                      formatViewCount={formatViewCount}
                    />
                  ))
                }
              </Box>
            </>
          ) : activeTab === 1 ? (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                textAlign: 'center', 
                py: { xs: 2, sm: 3, md: 4 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              You haven&apos;t bookmarked any videos yet.
            </Typography>
          ) : null}
        </>
      )}

      {/* Divider between sections when showing all */}
      {activeTab === 0 && bookmarkedVideos.length > 0 && bookmarkedChannels.length > 0 && (
        <Divider sx={{ my: { xs: 2, sm: 3, md: 4 } }} />
      )}

      {/* Channels Section */}
      {(activeTab === 0 || activeTab === 2) && (
        <>
          {bookmarkedChannels.length > 0 ? (
            <>
              {activeTab === 0 && (
                <Typography 
                  variant={isExtraSmall ? "h6" : "h5"} 
                  component="h2" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                    mb: { xs: 1, sm: 1.5 }
                  }}
                >
                  Bookmarked Channels
                </Typography>
              )}
              <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                {bookmarkedChannels
                  .sort((a, b) => b.bookmarkedAt - a.bookmarkedAt)
                  .map(channel => (
                    <ChannelCard key={channel.id} channel={channel} />
                  ))
                }
              </Box>
            </>
          ) : activeTab === 2 ? (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                textAlign: 'center', 
                py: { xs: 2, sm: 3, md: 4 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              You haven&apos;t bookmarked any channels yet.
            </Typography>
          ) : null}
        </>
      )}

      {/* No bookmarks message */}
      {activeTab === 0 && bookmarkedVideos.length === 0 && bookmarkedChannels.length === 0 && (
        <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 6, md: 8 } }}>
          <Typography 
            variant={isExtraSmall ? "subtitle1" : "h6"} 
            color="text.secondary" 
            gutterBottom
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}
          >
            You don&apos;t have any bookmarks yet
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Start exploring videos and channels and bookmark your favorites!
          </Typography>
        </Box>
      )}
    </Container>
  );
};
