import { useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Stack
} from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';
import RefreshIcon from '@mui/icons-material/Refresh';
import { processAIVideoAction } from '../../../apis/aiVideoActions/client';
import { aiActions, VideoActionType } from '../../../services/AiActions';
import type { PlayerAPI } from '@/client/routes/Video/Video';

interface AIVideoActionsProps {
  videoId: string;
  actionType: VideoActionType;
  playerApi?: PlayerAPI;
}

export const AIVideoActions = ({ videoId, actionType, playerApi }: AIVideoActionsProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cost, setCost] = useState<number>(0);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [duration, setDuration] = useState<number | null>(null);

  // Process the AI action
  const processAction = useCallback(async (bypassCache = false, overrideActionType?: VideoActionType) => {
    if (!videoId) {
      setError('No video ID provided. Please access this page from a video.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCost(0);
    setIsFromCache(false);
    setDuration(null);

    const start = performance.now();
    try {
      const response = await processAIVideoAction({
        videoId,
        actionType: overrideActionType || actionType
      }, {
        bypassCache
      });
      const end = performance.now();
      setDuration((end - start) / 1000);

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
      setDuration(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [videoId, setLoading, setError, setResult, setCost, setIsFromCache, setDuration]);

  // Regenerate the result without using cache
  const handleRegenerate = () => {
    processAction(true);
  };

  // Process action when the videoId or actionType changes
  useEffect(() => {
    if (!videoId) {
      setError('No video ID provided. Please access this page from a video.');
      return;
    }
    processAction(false, actionType);
  }, [videoId, actionType]);

  // Render the appropriate content based on the action type
  const renderActionResult = (): ReactNode => {
    if (!result) return null;
    const Renderer = aiActions[actionType].renderer;
    return <Renderer
      result={result as Parameters<typeof Renderer>[0]['result']}
      videoId={videoId}
      playerApi={playerApi}
    />;
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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon fontSize="small" />}
              onClick={handleRegenerate}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
            </Button>
          </Alert>
        )}
        {/* Status Bar */}
        {!loading && !error && (isFromCache || cost > 0 || duration !== null) && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2, px: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {(isFromCache || cost > 0) && (
                <Button
                  startIcon={isFromCache ? <CachedIcon fontSize="small" /> : <RefreshIcon fontSize="small" />}
                  variant="outlined"
                  size="small"
                  color={isFromCache ? "secondary" : "primary"}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    py: 0.5
                  }}
                >
                  {isFromCache ? 'From Cache' : `Cost: $${cost.toFixed(4)}`}
                </Button>
              )}
              {duration !== null && (
                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    py: 0.5
                  }}
                >
                  {`Duration: ${duration.toFixed(2)}s`}
                </Button>
              )}
              {/* Regenerate Button */}
              {!!result && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon fontSize="small" />}
                  onClick={handleRegenerate}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    py: 0.5
                  }}
                >
                  Regenerate
                </Button>
              )}
            </Box>
          </Stack>
        )}
      </Box>
      {/* Rendered AI Action Result */}
      {renderActionResult()}
    </Box>
  );
};
