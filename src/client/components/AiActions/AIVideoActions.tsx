import { useState, useEffect, ReactNode } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Button,
  Alert,
  Chip
} from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import RefreshIcon from '@mui/icons-material/Refresh';
import { processAIVideoAction } from '../../../apis/aiVideoActions/client';
import { aiActions, VideoActionType } from '../../../services/AiActions';

interface AIVideoActionsProps {
  videoId: string;
  initialActionType?: VideoActionType;
}

export const AIVideoActions = ({ videoId, initialActionType = 'summary' }: AIVideoActionsProps) => {
  const [actionType, setActionType] = useState<VideoActionType>(initialActionType);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cost, setCost] = useState<number>(0);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

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
        setResult(response.data.result as Record<string, unknown>);
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

  // Check for video ID and process action when the component mounts or when initialActionType changes
  useEffect(() => {
    if (!videoId) {
      setError('No video ID provided. Please access this page from a video.');
      return;
    }
    
    // Update the action type if initialActionType changes
    if (initialActionType && initialActionType !== actionType) {
      setActionType(initialActionType);
    }
    
    // Process the action
    processAction(false, initialActionType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, initialActionType]);

  // Render the appropriate content based on the action type
  const renderActionResult = (): ReactNode => {
    if (!result) return null;
    const Renderer = aiActions[actionType].rendeder;
    // Type assertion to tell TypeScript that we know what we're doing
    // Each renderer is responsible for handling its specific result type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Renderer result={result as any} videoId={videoId} />;
  };

  return (
    <Box sx={{ 
      maxWidth: '100%', 
      mx: 'auto',
      overflow: 'hidden'
    }}>
      {/* Status and Controls */}
      <Box sx={{ mb: 3 }}>
        {/* Loading State */}
        {loading && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexDirection: 'column',
            py: 4
          }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Processing {aiActions[actionType].label}...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Error Processing Video
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => processAction()}
                sx={{ borderRadius: 2 }}
              >
                Try Again
              </Button>
            </Box>
          </Alert>
        )}

        {/* Success State with Controls */}
        {!loading && !error && result && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            mb: 2
          }}>
            {/* Cache Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isFromCache ? (
                <Chip 
                  icon={<CachedIcon fontSize="small" />}
                  label="From Cache" 
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              ) : (
                <Chip 
                  label={`Cost: $${cost.toFixed(4)}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
            
            {/* Regenerate Button */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRegenerate}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Regenerate
            </Button>
          </Box>
        )}
      </Box>

      {/* Result Content */}
      {!loading && !error && result && (
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          {renderActionResult()}
        </Box>
      )}

      {/* Empty State */}
      {!loading && !error && !result && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4, 
          px: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider'
        }}>
          <Typography variant="subtitle1" gutterBottom>
            No {aiActions[actionType].label} Generated Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click the button below to process this video.
          </Typography>
          <Button
            variant="contained"
            onClick={() => processAction()}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Generate {aiActions[actionType].label}
          </Button>
        </Box>
      )}
    </Box>
  );
};
