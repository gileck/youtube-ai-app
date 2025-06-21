import {
  Box,
  Typography,
  CardMedia,
  IconButton,
  Tooltip,
  Avatar
} from '@mui/material';
import { YouTubeVideoSearchResult } from '@/shared/types/youtube';
import { useRouter } from '../../../router';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useState, useEffect } from 'react';
import { 
  bookmarkVideo, 
  removeBookmarkedVideo, 
  isVideoBookmarked 
} from '../../../utils/bookmarksApi';

interface VideoCardProps {
  video: YouTubeVideoSearchResult;
  formatDuration: (duration: string) => string;
  formatViewCount: (viewCount: string) => string;
}

export const VideoCard = ({ video, formatDuration, formatViewCount }: VideoCardProps) => {
  const { navigate } = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      try {
        const bookmarked = await isVideoBookmarked(video.id);
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };
    
    checkBookmarkStatus();
  }, [video.id]);
  
  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/channel/${video.channelId}`);
  };

  const handleVideoClick = () => {
    navigate(`/video/${video.id}`);
  };

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (isBookmarked) {
        await removeBookmarkedVideo(video.id);
        setIsBookmarked(false);
      } else {
        await bookmarkVideo(video);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
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
        p: { xs: 1, sm: 1.5, md: 2 },
        borderRadius: 1
      }}
      onClick={handleVideoClick}
    >
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        p: 0
      }}>
        {/* Thumbnail with duration */}
        <Box sx={{ 
          position: 'relative',
          width: '100%',
          mb: { xs: 1, sm: 1.5, md: 2 },
          borderRadius: { xs: 1, sm: 1.5, md: 2 },
          overflow: 'hidden'
        }}>
          <CardMedia
            component="img"
            sx={{ 
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
            image={video.thumbnailUrl}
            alt={video.title}
          />
          {video.duration && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                bgcolor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                fontWeight: 'medium',
                fontSize: '0.75rem',
                padding: '2px 4px',
                borderRadius: '4px',
              }}
            >
              {formatDuration(video.duration)}
            </Box>
          )}
        </Box>
        
        {/* Video info section */}
        <Box sx={{ display: 'flex', mt: 1 }}>
          {/* Channel Avatar */}
          <Box sx={{ mr: 1.5 }}>
            <Avatar 
              src={video.channelThumbnailUrl}
              sx={{ 
                width: { xs: 36, sm: 36, md: 40 }, 
                height: { xs: 36, sm: 36, md: 40 },
                bgcolor: 'primary.main'
              }}
              onClick={handleChannelClick}
            >
              {video.channelTitle ? video.channelTitle.charAt(0).toUpperCase() : '?'}
            </Avatar>
          </Box>
          
          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Title */}
            <Box sx={{ display: 'flex', mb: 0.5 }}>
              <Typography 
                variant="subtitle1"
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.1rem', md: '1.3rem' },
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                  mb: 0.5,
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1
                }}
              >
                {video.title}
              </Typography>
              
              <Tooltip title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}>
                <IconButton 
                  size="small" 
                  onClick={handleBookmarkClick}
                  sx={{ ml: 0.5 }}
                >
                  {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Channel name and video stats on same line */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.9rem',
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
                onClick={handleChannelClick}
              >
                {video.channelTitle}
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.9rem',
                  color: 'text.secondary',
                  ml: 0.5
                }}
              >
                • {formatViewCount(video.viewCount)} • {video.publishedAt}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
