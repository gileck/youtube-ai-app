import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Chip,
  SelectChangeEvent,
  Button,
  Tooltip,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { useRouter } from '../../router';
import { processAIVideoAction } from '../../../apis/aiVideoActions/client';
import { VideoActionType } from '../../../server/ai/video-actions';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CachedIcon from '@mui/icons-material/Cached';
import RefreshIcon from '@mui/icons-material/Refresh';
import { actionRenderers } from './aiActionsRenderers';

// Available action types
const actionTypes: { value: VideoActionType; label: string; icon: React.ReactNode }[] = [
  { value: 'summary', label: 'Summarize Video', icon: <SummarizeIcon /> },
];

export const AIVideoActions = () => {
  const { queryParams, navigate } = useRouter();
  const videoId = queryParams.id as string;
  const [actionType, setActionType] = useState<VideoActionType>('summary');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [cost, setCost] = useState<number>(0);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  
  // Theme and responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Process the AI action
  const processAction = async (bypassCache = false) => {
    if (!videoId) {
      setError('No video ID provided. Please access this page from a video.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult('');
    setCost(0);
    setIsFromCache(false);

    try {
      const response = await processAIVideoAction({
        videoId,
        actionType
      }, {
        bypassCache
      });

      if (response.data?.error) {
        setError(response.data.error);
      } else if (response.data) {
        setResult(response.data.result);
        setCost(response.data.cost.totalCost);
        setIsFromCache(response.isFromCache);
      } else {
        setError('Failed to process the video. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while processing the video');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Regenerate the result without using cache
  const handleRegenerate = () => {
    processAction(true);
  };

  // Process the action automatically when the page loads with a video ID
  useEffect(() => {
    if (videoId) {
      processAction();
    } else {
      setError('No video ID provided. Please access this page from a video.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, actionType]);

  // Handle action type change
  const handleActionTypeChange = (event: SelectChangeEvent<VideoActionType>) => {
    setActionType(event.target.value as VideoActionType);
  };

  // View the original video
  const handleViewVideo = () => {
    if (videoId) {
      navigate(`/video/${videoId}`);
    }
  };

  // View the video chapters
  const handleViewChapters = () => {
    if (videoId) {
      navigate(`/video-chapters?id=${videoId}`);
    }
  };

  // Go back to the video page
  const handleBackToVideo = () => {
    if (videoId) {
      navigate(`/video/${videoId}`);
    } else {
      navigate('/search');
    }
  };

  // Render the appropriate content based on the action type
  const renderActionResult = () => {
    if (!result) return null;

    // Get the renderer component for the current action type
    const Renderer = actionRenderers[actionType];
    
    // If a renderer exists for this action type, use it
    if (Renderer) {
      return <Renderer result={result} />;
    }
    
    // Fallback for any unimplemented action types
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          bgcolor: 'background.default',
          borderRadius: 2,
          maxHeight: '600px',
          overflow: 'auto'
        }}
      >
        <Typography variant="body1">{result}</Typography>
      </Paper>
    );
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      maxWidth: '100%', 
      mx: 'auto',
      overflow: 'hidden'
    }}>
      <Paper 
        elevation={2} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden', 
          mb: 3, 
          p: { xs: 2, sm: 3 }
        }}
      >
        {/* Header with back button */}
        <Box 
          sx={{ 
            display: 'flex', 
            mb: 2,
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBackToVideo}
            sx={{ 
              mr: isMobile ? 0 : 2,
              mb: isMobile ? 1 : 0,
              color: theme.palette.primary.main,
              px: 2,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
            variant="text"
          >
            BACK TO VIDEO
          </Button>
          {!isMobile && (
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              AI Video Actions
            </Typography>
          )}
        </Box>
        
        {isMobile && (
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            AI Video Actions
          </Typography>
        )}
        
        {/* Video ID chip */}
        {videoId ? (
          <Chip 
            label={`Video ID: ${videoId}`} 
            color="primary" 
            variant="outlined" 
            onClick={handleViewVideo}
            sx={{ 
              mb: 2,
              borderRadius: 4,
              px: 1,
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No video ID provided. Please access this page from a video.
          </Alert>
        )}

        <Typography 
          variant="body1" 
          color="text.secondary" 
          paragraph
          sx={{ mb: 3 }}
        >
          Process YouTube videos with AI to generate summaries and other useful content.
        </Typography>

        {/* Action controls - stacked on mobile */}
        <Stack 
          direction={isMobile ? 'column' : 'row'} 
          spacing={2} 
          sx={{ mb: 3 }}
          alignItems={isMobile ? 'stretch' : 'center'}
        >
          <FormControl 
            variant="outlined" 
            sx={{ 
              minWidth: isMobile ? '100%' : 200,
              mb: isMobile ? 1 : 0
            }}
            fullWidth={isMobile}
          >
            <InputLabel id="action-type-label">Action Type</InputLabel>
            <Select
              labelId="action-type-label"
              value={actionType}
              onChange={handleActionTypeChange}
              label="Action Type"
              disabled={loading}
              sx={{
                borderRadius: 1,
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
            >
              {actionTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {type.icon}
                    <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Stack 
            direction="row" 
            spacing={1}
            sx={{ width: isMobile ? '100%' : 'auto' }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => processAction()}
              disabled={loading || !videoId}
              sx={{ 
                flex: isMobile ? 1 : 'auto',
                borderRadius: 2,
                py: 1.5,
                textTransform: 'uppercase',
                fontWeight: 'bold'
              }}
            >
              {isMobile ? 'PROCESS' : 'PROCESS VIDEO'}
            </Button>

            {result && (
              <Tooltip title="Generate a fresh result without using cache">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleRegenerate}
                  disabled={loading || !videoId}
                  startIcon={!isMobile && <RefreshIcon />}
                  sx={{ 
                    flex: isMobile ? 1 : 'auto',
                    borderRadius: 2,
                    py: 1.5,
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}
                >
                  {isMobile ? 'REFRESH' : 'REGENERATE'}
                </Button>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading indicator */}
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            py: 5 
          }}>
            <CircularProgress color="primary" />
            <Typography sx={{ ml: 2 }}>Processing video...</Typography>
          </Box>
        )}

        {/* Results section */}
        {result && (
          <Box>
            {/* Result header with metadata */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                mb: 2
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: isMobile ? 'flex-start' : 'center',
                  mb: isMobile ? 1 : 0
                }}>
                  <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold' }}>
                    {actionTypes.find(t => t.value === actionType)?.label || 'Result'}
                  </Typography>
                  {isFromCache && (
                    <Tooltip title="Result retrieved from cache">
                      <CachedIcon 
                        color="primary" 
                        fontSize="small" 
                        sx={{ ml: 1 }} 
                      />
                    </Tooltip>
                  )}
                </Box>
                
                <Stack 
                  direction="row" 
                  spacing={1}
                  sx={{
                    flexWrap: 'wrap',
                    gap: 1
                  }}
                >
                  <Chip 
                    label={`Cost: $${cost.toFixed(4)}`} 
                    color="primary" 
                    variant="outlined" 
                    sx={{ 
                      borderRadius: 4,
                      fontWeight: 'medium'
                    }}
                  />
                  {isFromCache && (
                    <Chip 
                      label="Cached" 
                      color="secondary" 
                      variant="outlined" 
                      icon={<CachedIcon />}
                      sx={{ 
                        borderRadius: 4,
                        fontWeight: 'medium'
                      }}
                    />
                  )}
                </Stack>
              </Box>

              {/* Navigation buttons */}
              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ mb: 2 }}
                flexWrap="wrap"
                useFlexGap
              >
                <Button
                  variant="outlined"
                  size={isMobile ? "medium" : "small"}
                  onClick={handleViewVideo}
                  startIcon={<SummarizeIcon />}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    mb: isMobile ? 1 : 0
                  }}
                >
                  View Video
                </Button>
                <Button
                  variant="outlined"
                  size={isMobile ? "medium" : "small"}
                  onClick={handleViewChapters}
                  startIcon={<SubtitlesIcon />}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    mb: isMobile ? 1 : 0
                  }}
                >
                  View Chapters & Transcript
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />
            
            {/* Render the result content */}
            {renderActionResult()}
          </Box>
        )}
      </Paper>
    </Box>
  );
};
