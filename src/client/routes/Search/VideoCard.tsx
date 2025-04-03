import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Avatar,
  Chip
} from '@mui/material';
import { YouTubeVideoSearchResult } from '../../../server/youtube/types';

interface VideoCardProps {
  video: YouTubeVideoSearchResult;
  formatDuration: (duration: string) => string;
  formatViewCount: (viewCount: string) => string;
}

export const VideoCard = ({ video, formatDuration, formatViewCount }: VideoCardProps) => {
  return (
    <Card 
      elevation={0} 
      sx={{ 
        display: 'flex', 
        bgcolor: 'background.paper',
        border: 'none',
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover': {
          bgcolor: 'action.hover',
        }
      }}
    >
      <CardActionArea 
        sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', textAlign: 'left' }}
        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
      >
        <Box sx={{ position: 'relative', minWidth: { xs: 120, sm: 240 }, height: { xs: 90, sm: 135 } }}>
          <CardMedia
            component="img"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            image={video.thumbnailUrl}
            alt={video.title}
          />
          {video.duration && (
            <Chip
              label={formatDuration(video.duration)}
              size="small"
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                height: 24
              }}
            />
          )}
        </Box>
        
        <CardContent sx={{ flex: '1 1 auto', p: 2 }}>
          <Typography variant="subtitle1" component="div" fontWeight="bold" gutterBottom>
            {video.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {formatViewCount(video.viewCount)} • {video.publishedAt}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ width: 24, height: 24, mr: 1 }}
              alt={video.channelTitle}
              src="/static/images/avatar/1.jpg" // Placeholder, would need actual channel avatar
            />
            <Typography variant="body2" color="text.secondary">
              {video.channelTitle}
            </Typography>
          </Box>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mt: 1,
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
            }}
          >
            {video.description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
