import {
  Box,
  Typography,
  CardMedia,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { YouTubeVideoSearchResult } from '../../../../server/youtube/types';
import { useRouter } from '../../../router';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useState, useEffect } from 'react';
import { 
  bookmarkVideo, 
  removeBookmarkedVideo, 
  isVideoBookmarked 
} from '../../../utils/bookmarksStorage';

interface VideoCardProps {
  video: YouTubeVideoSearchResult;
  formatDuration: (duration: string) => string;
  formatViewCount: (viewCount: string) => string;
}

export const VideoCard = ({ video, formatDuration, formatViewCount }: VideoCardProps) => {
  const { navigate } = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmall = useMediaQuery('(max-width:400px)');
  
  useEffect(() => {
    setIsBookmarked(isVideoBookmarked(video.id));
  }, [video.id]);
  
  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/channel/${video.channelId}`);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isBookmarked) {
      removeBookmarkedVideo(video.id);
      setIsBookmarked(false);
    } else {
      bookmarkVideo(video);
      setIsBookmarked(true);
    }
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        },
        p: { xs: 0.5, sm: 0.75, md: 1 },
        borderRadius: 1
      }}
      onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
    >
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        p: 0
      }}>
        <Box sx={{ 
          position: 'relative',
          width: '100%',
          mb: { xs: 0.5, sm: 0.75, md: 1 }
        }}>
          <CardMedia
            component="img"
            sx={{ 
              width: '100%',
              height: 'auto',
              borderRadius: { xs: 1, sm: 1.5, md: 2 }
            }}
            image={video.thumbnailUrl}
            alt={video.title}
          />
          {video.duration && (
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: 4, sm: 6, md: 8 },
                right: { xs: 4, sm: 6, md: 8 },
                bgcolor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                padding: { xs: '1px 3px', sm: '2px 4px' },
                borderRadius: '2px',
              }}
            >
              {formatDuration(video.duration)}
            </Box>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography 
            variant={isExtraSmall ? "subtitle1" : "h6"} 
            component="div" 
            sx={{
              fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.1rem' },
              fontWeight: 'bold',
              mb: { xs: 0.25, sm: 0.5 },
              textAlign: 'left',
              flexGrow: 1,
              lineHeight: 1.2
            }}
          >
            {video.title}
          </Typography>
          
          <Tooltip title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}>
            <IconButton 
              size={isSmallScreen ? "small" : "medium"} 
              onClick={handleBookmarkClick}
              sx={{ ml: 0.5 }}
            >
              {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
              color: 'primary.main',
              textAlign: 'left',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
            onClick={handleChannelClick}
          >
            {video.channelTitle}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
              color: 'text.secondary',
              textAlign: 'left',
              ml: 0.5
            }}
          >
            | {formatViewCount(video.viewCount)} | {video.publishedAt}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
