import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  Button,
  Tooltip,
  useTheme,
  useMediaQuery,
  Stack,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import RefreshIcon from '@mui/icons-material/Refresh';
import { processAIVideoAction } from '../../../apis/aiVideoActions/client';
import { aiActions, VideoActionType } from '../../../services/AiActions';

// Available action types

export const AIVideoActions = ({videoId}: { videoId: string }) => {
  const [actionType, setActionType] = useState<VideoActionType>('summary');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [cost, setCost] = useState<number>(0);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  
  // Theme and responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Process the AI action
  const processAction = async (bypassCache = false, overrideActionType?: VideoActionType) => {
    if (!videoId) {
      setError('No video ID provided. Please access this page from a video.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCost(0);
    setIsFromCache(false);

    try {
      const response = await processAIVideoAction({
        videoId,
        actionType: overrideActionType || actionType
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

  // Handle AI action button click
  const handleActionButtonClick = (type: VideoActionType) => {
    setActionType(type);
    processAction(false, type);
  };

  // Check for video ID when the component mounts
  useEffect(() => {
    if (!videoId) {
      setError('No video ID provided. Please access this page from a video.');
    }
  }, [videoId]);

  // Render the appropriate content based on the action type
  const renderActionResult = () => {
    if (!result) return null;
    const Renderer = aiActions[actionType].rendeder
    // Type assertion to tell TypeScript that we know what we're doing
    // Each renderer is responsible for handling its specific result type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Renderer result={result as any} videoId={videoId} />;
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      maxWidth: '100%', 
      mx: 'auto',
      overflow: 'hidden'
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 4, 
          overflow: 'hidden', 
          mb: 4, 
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
          bgcolor: 'background.paper',
          p: { xs: 2.5, sm: 4 },
          maxWidth: 700,
          mx: 'auto',
        }}
      >
        {/* Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            mb: 3,
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: 2,
            bgcolor: 'background.default',
            borderRadius: 3,
            p: { xs: 1.5, sm: 2 },
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
          }}
        >
          <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 800, letterSpacing: -0.5, flex: 1, textAlign: isMobile ? 'left' : 'center', color: 'text.primary' }}>
            AI Video Actions
          </Typography>
        </Box>

        {/* AI Action Buttons */}
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={1}
          sx={{ mb: 3, alignItems: isMobile ? 'stretch' : 'center', flexWrap: 'wrap', gap: 1 }}
          useFlexGap
        >
          {Object.entries(aiActions).map(([key, type]) => (
            <Button
              key={key}
              variant={actionType === key ? 'contained' : 'outlined'}
              color="primary"
              startIcon={<type.icon />}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                flex: 1,
                minWidth: 120,
                mb: isMobile ? 1 : 0,
                borderRadius: 3,
                fontWeight: 600,
                fontSize: isMobile ? '0.93rem' : '1.05rem',
                whiteSpace: 'nowrap',
                px: 1.5,
                textTransform: 'none',
                ...(isMobile && { minWidth: 0, width: '100%' })
              }}
              onClick={() => handleActionButtonClick(key as VideoActionType)}
              disabled={loading}
            >
              {type.label}
            </Button>
          ))}
        </Stack>

        {/* Process/Regenerate Buttons */}
        <Stack 
          direction={isMobile ? 'column' : 'row'} 
          spacing={2} 
          sx={{ mb: 3, alignItems: isMobile ? 'stretch' : 'center' }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => processAction()}
            disabled={loading || !videoId}
            sx={{ 
              flex: isMobile ? 1 : 'auto',
              borderRadius: 3,
              py: 1.5,
              textTransform: 'uppercase',
              fontWeight: 700,
              fontSize: '1.08rem',
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)',
            }}
          >
            {isMobile ? 'Process' : 'Process Video'}
          </Button>
          {!!result && (
            <Tooltip title="Generate a fresh result without using cache">
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleRegenerate}
                disabled={loading || !videoId}
                startIcon={!isMobile && <RefreshIcon />}
                sx={{ 
                  flex: isMobile ? 1 : 'auto',
                  borderRadius: 3,
                  py: 1.5,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '1.08rem',
                }}
              >
                {isMobile ? 'Refresh' : 'Regenerate'}
              </Button>
            </Tooltip>
          )}
        </Stack>

        {/* Error message */}
        {error ? (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontSize: '1.05rem' }}>
            {error}
          </Alert>
        ) : ''}
        {/* Loading indicator */}
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            py: 5 
          }}>
            <CircularProgress color="primary" />
            <Typography sx={{ ml: 2, fontWeight: 500, fontSize: '1.08rem' }}>Processing video...</Typography>
          </Box>
        )}
        {/* Results section */}
        {!!result && (
          <Box>
            {/* Result header with metadata */}
            <Box sx={{ mb: 2 }}>
              {/* Navigation buttons */}
              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ mb: 2 }}
                flexWrap="wrap"
                useFlexGap
              >
                {/* (reserved for future navigation if needed) */}
              </Stack>
            </Box>
            <Divider sx={{ my: 2 }} />
            {/* Render the result content */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                mb: 2
              }}>
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
                    fontWeight: 500,
                    fontSize: '0.98rem',
                    bgcolor: 'background.default',
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
                      fontWeight: 100,
                      fontSize: '0.98rem',
                      bgcolor: 'background.default',
                    }}
                  />
                )}
              </Stack>
            </Box>
            {renderActionResult()}
          </Box>
        )}
      </Paper>
    </Box>
  );
};
