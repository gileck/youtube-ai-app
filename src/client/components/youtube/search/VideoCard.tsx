import {
  Box,
  Typography,
  CardMedia
} from '@mui/material';
import { YouTubeVideoSearchResult } from '../../../../server/youtube/types';
import { useRouter } from '../../../router';

interface VideoCardProps {
  video: YouTubeVideoSearchResult;
  formatDuration: (duration: string) => string;
  formatViewCount: (viewCount: string) => string;
}

export const VideoCard = ({ video, formatDuration, formatViewCount }: VideoCardProps) => {
  const { navigate } = useRouter();
  
  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/channel/${video.channelId}`);
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        }
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
          mb: 1
        }}>
          <CardMedia
            component="img"
            sx={{ 
              width: '100%',
              height: 'auto',
              borderRadius: 2
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
                fontWeight: 'bold',
                fontSize: '0.75rem',
                padding: '2px 4px',
                borderRadius: '2px',
              }}
            >
              {formatDuration(video.duration)}
            </Box>
          )}
        </Box>
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            mb: 0.5,
            textAlign: 'left'
          }}
        >
          {video.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontSize: '0.8rem',
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
              fontSize: '0.8rem',
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
