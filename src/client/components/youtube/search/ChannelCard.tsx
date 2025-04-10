import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button,
  Avatar,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { YouTubeChannelSearchResult } from '../../../../server/youtube/types';
import { useRouter } from '../../../router';
import { 
  bookmarkChannel, 
  removeBookmarkedChannel, 
  isChannelBookmarked 
} from '../../../utils/bookmarksStorage';

interface ChannelCardProps {
  channel: YouTubeChannelSearchResult;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel }) => {
  const subscriberCount = channel.subscriberCount;
  const { navigate } = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmall = useMediaQuery('(max-width:400px)');
  
  useEffect(() => {
    setIsBookmarked(isChannelBookmarked(channel.id));
  }, [channel.id]);
  
  const handleChannelClick = () => {
    navigate(`/channel/${channel.id}`);
  };
  
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isBookmarked) {
      removeBookmarkedChannel(channel.id);
      setIsBookmarked(false);
    } else {
      bookmarkChannel(channel);
      setIsBookmarked(true);
    }
  };
  
  return (
    <Card 
      sx={{ 
        display: 'flex', 
        mb: { xs: 1.5, sm: 2, md: 3 }, 
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 1,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        }
      }}
      onClick={handleChannelClick}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1, sm: 1.5, md: 2 },
        bgcolor: 'action.hover'
      }}>
        <Avatar 
          src={channel.thumbnailUrl} 
          alt={channel.title}
          sx={{ 
            width: { xs: 60, sm: 70, md: 80 }, 
            height: { xs: 60, sm: 70, md: 80 },
            mb: { xs: 0.5, sm: 1 }
          }}
        />
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        flexGrow: 1,
        p: { xs: 1, sm: 1.5, md: 2 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, sm: 1 } }}>
          <Typography 
            variant={isExtraSmall ? "subtitle1" : "h6"} 
            component="div" 
            sx={{ 
              fontWeight: 'bold', 
              mr: 1,
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
            }}
          >
            {channel.title}
          </Typography>
          {channel.isVerified && (
            <CheckCircleIcon 
              fontSize={isSmallScreen ? "small" : "medium"} 
              color="primary" 
            />
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}>
            <IconButton 
              size={isSmallScreen ? "small" : "medium"} 
              onClick={handleBookmarkClick}
            >
              {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0.5, sm: 1 } }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mr: 2,
              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
            }}
          >
            {subscriberCount}
          </Typography>
        </Box>
        
      </Box>
    </Card>
  );
};
