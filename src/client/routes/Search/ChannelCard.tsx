import React from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button,
  Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { YouTubeChannelSearchResult } from '../../../server/youtube/types';

interface ChannelCardProps {
  channel: YouTubeChannelSearchResult;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel }) => {
  const subscriberCount = channel.subscriberCount;
  
  return (
    <Card 
      sx={{ 
        display: 'flex', 
        mb: 3, 
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 1
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'action.hover'
      }}>
        <Avatar 
          src={channel.thumbnailUrl} 
          alt={channel.title}
          sx={{ 
            width: 80, 
            height: 80,
            mb: 1
          }}
        />
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        flexGrow: 1,
        p: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mr: 1 }}>
            {channel.title}
          </Typography>
          {channel.isVerified && (
            <CheckCircleIcon fontSize="small" color="primary" />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            {subscriberCount}
          </Typography>
          {/* <Typography variant="body2" color="text.secondary">
            {channel.videoCount}
          </Typography> */}
        </Box>
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            size="small"
            href={`https://www.youtube.com/channel/${channel.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Channel
          </Button>
        </Box>
      </Box>
    </Card>
  );
};
