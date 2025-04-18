import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  Avatar, 
  Button,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useRouter } from '../../router';
import { getYouTubeVideoDetails } from '../../../apis/youtube/client';
import { YouTubeVideoDetails } from '../../../shared/types/youtube';
import { formatViewCount, formatDate } from '../../components/youtube/search/utils';
import { AIVideoActions } from '@/client/components/AiActions/AIVideoActions';
import { VideoTranscript } from './VideoTranscript';
import { aiActions, VideoActionType } from '@/services/AiActions';

// Define valid tab types - now using VideoActionType
type TabType = VideoActionType | 'transcript' | 'more';

export const Video = () => {
  const { routeParams, navigate, currentPath } = useRouter();
  const videoId = routeParams.id;
  const tabParam = routeParams.tab as TabType | undefined;
  const [video, setVideo] = useState<YouTubeVideoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<TabType>('summary');
  
  // Theme and responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Determine the active tab from the URL path parameter
  useEffect(() => {
    if (tabParam && ['summary', 'transcript', 'keyPoints', 'podcastQA', 'more'].includes(tabParam)) {
      setTab(tabParam as TabType);
    } else if (!currentPath.includes('/video/' + videoId + '/')) {
      // If we're on the base video URL without a tab, default to summary
      setTab('summary');
    }
  }, [tabParam, videoId, currentPath]);

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

  // Update the URL when changing tabs using the generic tab parameter
  const handleTabChange = (newTab: TabType) => {
    setTab(newTab);
    if (newTab === 'summary' && !tabParam) {
      // If we're already on the base video URL and switching to summary,
      // no need to change the URL
      return;
    }
    navigate(`/video/${videoId}/${newTab}`, { replace: true });
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

  // Filter to only show Summary, Key Points, and Q&A buttons
  const visibleActions = Object.entries(aiActions).filter(
    ([key]) => ['summary', 'keyPoints', 'podcastQA'].includes(key)
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '600px', mx: 'auto' }}>
      {/* Video Player */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
        <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black' }}>
          <iframe
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            src={`https://www.youtube.com/embed/${videoId}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Box>
      </Paper>

      {/* Metadata Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {formatDate(video.publishedAt)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatViewCount(video.viewCount)}
        </Typography>
      </Box>

      {/* Title */}
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 1, px: 1, wordBreak: 'break-word' }}>
        {video.title}
      </Typography>

      {/* Channel Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, px: 1 }}>
        <Avatar
          src={video.channelImage || ''}
          alt={video.channelTitle}
          sx={{ width: 28, height: 28, mr: 1, cursor: 'pointer' }}
          onClick={handleChannelClick}
        />
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'bold', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={handleChannelClick}
        >
          {video.channelTitle}
        </Typography>
      </Box>

      {/* Description Box */}
      <Box sx={{ mb: 2, px: 1 }}>
        <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2, whiteSpace: 'pre-wrap', minHeight: 60 }}>
          <Typography variant="body2" component="div">
            {video.description ? (
              expanded ? video.description : getTruncatedDescription(video.description)
            ) : (
              'No description available.'
            )}
            {hasLongDescription && !expanded && (
              <Button onClick={toggleDescription} size="small" sx={{ ml: 1, textTransform: 'none' }}>
                ... more
              </Button>
            )}
            {hasLongDescription && expanded && (
              <Button onClick={toggleDescription} size="small" sx={{ ml: 1, textTransform: 'none' }}>
                Show less
              </Button>
            )}
          </Typography>
        </Paper>
      </Box>

      {/* AI Action Buttons (replacing Tabs) */}
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={1}
        sx={{ 
          mb: 2, 
          px: 1, 
          alignItems: isMobile ? 'stretch' : 'center', 
          flexWrap: 'wrap', 
          gap: 1 
        }}
        useFlexGap
      >
        {/* AI Action Buttons */}
        {visibleActions.map(([key, type]) => (
          <Button
            key={key}
            variant={tab === key ? 'contained' : 'outlined'}
            color="primary"
            startIcon={<type.icon />}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              flex: 1,
              minWidth: isMobile ? 'auto' : 120,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: isMobile ? '0.8rem' : '0.875rem',
              whiteSpace: 'nowrap',
              textTransform: 'none'
            }}
            onClick={() => handleTabChange(key as TabType)}
          >
            {type.label}
          </Button>
        ))}
        
        {/* Transcript Button */}
        <Button 
          variant={tab === 'transcript' ? 'contained' : 'outlined'} 
          onClick={() => handleTabChange('transcript')} 
          sx={{ 
            flex: 1,
            minWidth: isMobile ? 'auto' : 120,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: isMobile ? '0.8rem' : '0.875rem',
            whiteSpace: 'nowrap',
            textTransform: 'none'
          }}
          size={isMobile ? 'small' : 'medium'}
        >
          Transcript
        </Button>
      </Stack>

      {/* Main Content Area */}
      <Paper elevation={0} sx={{ p: 2, minHeight: 120, bgcolor: 'background.default', borderRadius: 2, mb: 2, px: 1 }}>
        {(tab === 'summary' || tab === 'keyPoints' || tab === 'podcastQA') && (
          <AIVideoActions videoId={videoId} initialActionType={tab as VideoActionType} />
        )}
        {tab === 'transcript' && (
          <VideoTranscript videoId={videoId} />
        )}
        {tab === 'more' && (
          <Typography variant="body2" color="text.secondary">More features coming soon...</Typography>
        )}
      </Paper>
    </Box>
  );
};
