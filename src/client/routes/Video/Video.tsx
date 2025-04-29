import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Avatar,
  Button,
  useTheme,
  useMediaQuery,
  IconButton,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import { useRouter } from '../../router';
import { getYouTubeVideoDetails } from '../../../apis/youtube/client';
import { YouTubeVideoDetails } from '../../../shared/types/youtube';
import { formatViewCount, formatDate } from '../../components/youtube/search/utils';
import { AIVideoActions } from '@/client/components/AiActions/AIVideoActions';
import { VideoTranscript } from './VideoTranscript';
import { aiActions, VideoActionType } from '@/services/AiActions';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { bookmarkVideo, removeBookmarkedVideo, isVideoBookmarked } from '../../utils/bookmarksStorage';
import { mediaEvents } from '../../utils/mediaEvents';
import { MiniPlayer } from './MiniPlayer';
import { processAIVideoAction } from '../../../apis/aiVideoActions/client';
import { CustomRenderer } from '@/services/AiActions/CustomAction/CustomRenderer';

export type PlayerAPI = {
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
};

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
  const [actionTab, setActionTab] = useState<TabType>(tabParam || 'summary');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [questionResult, setQuestionResult] = useState<any>(null);
  const [questionLoading, setQuestionLoading] = useState(false);

  // Remove main player references and keep only mini player related states
  const [miniPlayerVisible, setMiniPlayerVisible] = useState(false);
  const [miniPlayerClosed, setMiniPlayerClosed] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const miniPlayerRef = useRef<React.ElementRef<typeof MiniPlayer>>(null);

  // Theme and responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Update the useEffect that listens for events
  useEffect(() => {
    // Subscribe to timestamp jump events from other components
    const unsubscribe = mediaEvents.onTimestampJump((timestamp) => {
      // Only control the mini player - show it if it was previously closed
      setMiniPlayerVisible(true);
      setMiniPlayerClosed(false);
      setCurrentTime(timestamp);
    });

    return unsubscribe;
  }, []);

  // Determine the active tab from the URL path parameter
  useEffect(() => {
    if (tabParam && ['summary', 'transcript', 'keyPoints', 'podcastQA', 'more'].includes(tabParam)) {
      setActionTab(tabParam as TabType);
    } else if (!currentPath.includes('/video/' + videoId + '/')) {
      // If we're on the base video URL without a tab, default to summary
      setActionTab('summary');
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
          if (result.data.questions) {
            setQuestions(result.data.questions);
          }
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

  useEffect(() => {
    if (videoId) {
      setIsBookmarked(isVideoBookmarked(videoId));
    }
  }, [videoId]);

  // PlayerAPI now only controls the mini player
  const playerApi = useMemo(() => ({
    play: () => {
      if (miniPlayerRef.current) {
        setMiniPlayerVisible(true);
        miniPlayerRef.current.play();
      }
    },
    pause: () => {
      if (miniPlayerRef.current) {
        miniPlayerRef.current.pause();
      }
    },
    seekTo: (time: number) => {
      if (miniPlayerRef.current) {
        setMiniPlayerVisible(true);
        miniPlayerRef.current.seekTo(time);
      }
    },
    getCurrentTime: () => {
      return miniPlayerRef.current ? miniPlayerRef.current.getCurrentTime() : currentTime;
    }
  }), [currentTime]);

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

  const handleBookmarkToggle = () => {
    if (!video || !videoId) return;

    if (isBookmarked) {
      removeBookmarkedVideo(videoId);
    } else {
      bookmarkVideo({
        id: videoId,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl || '',
        channelId: video.channelId,
        channelTitle: video.channelTitle,
        publishedAt: video.publishedAt,
        viewCount: video.viewCount,
        duration: video.duration,
        description: video.description || ''
      });
    }

    setIsBookmarked(!isBookmarked);
  };

  const handleTabChange = (newTab: TabType) => {
    setActionTab(newTab);
    navigate(`/video/${videoId}/${newTab}`);
  };

  const handleCloseMiniPlayer = () => {
    setMiniPlayerClosed(true);
  };

  const handleQuestionClick = async (question: string) => {
    setSelectedQuestion(question);
    setQuestionLoading(true);
    setQuestionResult(null);

    try {
      const response = await processAIVideoAction({
        videoId: videoId || '',
        actionType: 'custom',
        actionParams: {
          query: question,
          responseType: 'list',
          actionType: 'chapters'
        }
      }, {
        bypassCache: true
      }
      );

      if (response.data?.error) {
        console.error('Error processing question:', response.data.error);
      } else if (response.data?.result) {
        setQuestionResult(response.data.result);
      }
    } catch (error) {
      console.error('Error processing question:', error);
    } finally {
      setQuestionLoading(false);
    }
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
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '600px', mx: 'auto' }}>
      {/* Video Player - Simple iframe embed */}
      <Paper
        elevation={2}
        sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}
      >
        <Box
          sx={{
            position: 'relative',
            paddingTop: '56.25%', // 16:9 aspect ratio
            bgcolor: 'black',
            cursor: 'pointer',
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
            title={video.title}
          />
        </Box>
      </Paper>

      {/* Mini Player */}
      <MiniPlayer
        ref={miniPlayerRef}
        videoId={videoId}
        visible={miniPlayerVisible && !miniPlayerClosed}
        onClose={handleCloseMiniPlayer}
        currentTime={currentTime}
      />

      {/* Metadata Row */}
      <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>{video.title}</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={video.channelThumbnailUrl}
              alt={video.channelTitle}
              sx={{ mr: 1, cursor: 'pointer' }}
              onClick={handleChannelClick}
            />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ cursor: 'pointer' }}
                onClick={handleChannelClick}
              >
                {video.channelTitle}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatViewCount(video.viewCount)} views • {formatDate(video.publishedAt)}
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={handleBookmarkToggle} sx={{ color: isBookmarked ? 'primary.main' : 'inherit' }}>
            {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        </Box>

        {/* Description */}
        {video.description && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'pre-line' }}
            >
              {expanded ? video.description : getTruncatedDescription(video.description)}
            </Typography>

            {hasLongDescription && (
              <Button
                size="small"
                onClick={toggleDescription}
                sx={{ mt: 1 }}
              >
                {expanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* Questions Section */}
      {questions.length > 0 && (
        <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Questions about this video</Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {questions.map((question, index) => (
              <Chip
                key={index}
                label={question}
                onClick={() => handleQuestionClick(question)}
                color={selectedQuestion === question ? 'primary' : 'default'}
                sx={{ my: 0.5 }}
              />
            ))}
          </Stack>

          {questionLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {questionResult && !questionLoading && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>{selectedQuestion}</Typography>
              <CustomRenderer
                result={questionResult}
                videoId={videoId || ''}
                playerApi={playerApi}
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Tabs for different AI actions */}
      <Box sx={{ mb: 2, display: 'flex', overflowX: 'auto', pb: 1 }}>
        <Button
          variant={actionTab === 'summary' ? 'contained' : 'text'}
          onClick={() => handleTabChange('summary')}
          sx={{ mr: 1, whiteSpace: 'nowrap' }}
        >
          Summary
        </Button>
        <Button
          variant={actionTab === 'transcript' ? 'contained' : 'text'}
          onClick={() => handleTabChange('transcript')}
          sx={{ mr: 1, whiteSpace: 'nowrap' }}
        >
          Transcript
        </Button>
        <Button
          variant={actionTab === 'keyPoints' ? 'contained' : 'text'}
          onClick={() => handleTabChange('keyPoints')}
          sx={{ mr: 1, whiteSpace: 'nowrap' }}
        >
          Key Points
        </Button>
        <Button
          variant={actionTab === 'podcastQA' ? 'contained' : 'text'}
          onClick={() => handleTabChange('podcastQA')}
          sx={{ mr: 1, whiteSpace: 'nowrap' }}
        >
          Q&A
        </Button>
        <Button
          variant={actionTab === 'more' ? 'contained' : 'text'}
          onClick={() => handleTabChange('more')}
          sx={{ whiteSpace: 'nowrap' }}
        >
          More
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, minHeight: 120, bgcolor: 'background.default', borderRadius: 2, mb: 2, px: 1 }}>
        {actionTab === 'transcript' && (
          <VideoTranscript videoId={videoId} playerApi={playerApi} />
        )}
        {actionTab !== 'transcript' && (
          <AIVideoActions
            playerApi={playerApi}
            videoId={videoId}
            actionType={actionTab as VideoActionType} />
        )}
      </Paper>
    </Box>
  );
};
