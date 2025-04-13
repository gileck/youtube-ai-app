import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Paper, Divider, Chip, Avatar, useTheme, useMediaQuery, Button } from '@mui/material';
import { useRouter } from '../../router';
import { getYouTubeVideoDetails } from '../../../apis/youtube/client';
import { YouTubeVideoDetails } from '../../../shared/types/youtube';
import { formatViewCount, formatDate } from '../../components/youtube/search/utils';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export const Video = () => {
  const { routeParams, navigate } = useRouter();
  const videoId = routeParams.id;
  const [video, setVideo] = useState<YouTubeVideoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchVideoDetails = async () => {
      if (!videoId) {
        setError('Video ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getYouTubeVideoDetails({ videoId });
        
        if (result.data?.error) {
          setError(result.data.error.message);
        } else if (result.data?.video) {
          setVideo(result.data.video);
        } else {
          setError('Failed to load video details');
        }
      } catch (err) {
        setError('An error occurred while fetching video details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  const handleChannelClick = () => {
    if (video?.channelId) {
      navigate(`/channel/${video.channelId}`);
    }
  };

  const toggleDescription = () => {
    setExpanded(!expanded);
  };

  // Function to truncate description to first few lines
  const getTruncatedDescription = (description: string): string => {
    if (!description) return '';

    return description.slice(0, 300) + '...';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !video) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Video
        </Typography>
        <Typography>{error || 'Video not found'}</Typography>
      </Box>
    );
  }

  const hasLongDescription = video.description && video.description.length > 300;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '1200px', mx: 'auto' }}>
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          mb: 3
        }}
      >
        <Box 
          sx={{ 
            position: 'relative', 
            paddingTop: '56.25%', /* 16:9 Aspect Ratio */
            bgcolor: 'black'
          }}
        >
          <iframe
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            src={`https://www.youtube.com/embed/${videoId}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Box>
      </Paper>

      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom 
          sx={{ fontWeight: 'bold' }}
        >
          {video.title}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar 
                src={`https://i.ytimg.com/vi/${video.id}/default.jpg`} 
                alt={video.channelTitle}
                sx={{ mr: 1, cursor: 'pointer' }}
                onClick={handleChannelClick}
              />
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
                onClick={handleChannelClick}
              >
                {video.channelTitle}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            gap: 1
          }}>
            <Chip 
              icon={<VisibilityIcon fontSize="small" />} 
              label={formatViewCount(video.viewCount)} 
              variant="outlined" 
              size={isMobile ? "small" : "medium"}
            />
            <Chip 
              icon={<ThumbUpIcon fontSize="small" />} 
              label={formatViewCount(video.likeCount)} 
              variant="outlined"
              size={isMobile ? "small" : "medium"}
            />
            <Chip 
              icon={<CommentIcon fontSize="small" />} 
              label={formatViewCount(video.commentCount)} 
              variant="outlined"
              size={isMobile ? "small" : "medium"}
            />
            <Chip 
              icon={<CalendarTodayIcon fontSize="small" />} 
              label={formatDate(video.publishedAt)} 
              variant="outlined"
              size={isMobile ? "small" : "medium"}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Description</Typography>
            {hasLongDescription && (
              <Button 
                onClick={toggleDescription}
                variant="text" 
                size="small"
                endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {expanded ? 'Show Less' : 'Show More'}
              </Button>
            )}
          </Box>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: 'background.default',
              borderRadius: 2,
              whiteSpace: 'pre-wrap',
              transition: 'all 0.3s ease'
            }}
          >
            <Typography variant="body1" component="div">
              {video.description ? (
                expanded ? video.description : getTruncatedDescription(video.description)
              ) : (
                'No description available.'
              )}
            </Typography>
          </Paper>
        </Box>

        {video.tags && video.tags.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {video.tags.map((tag, index) => (
                <Chip 
                  key={index} 
                  label={tag} 
                  size={isMobile ? "small" : "medium"}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
