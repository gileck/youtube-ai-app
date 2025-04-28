import { Box, CircularProgress, Typography } from '@mui/material';

interface VideoFeedLoadingProps {
  progress: number;
  channelCount: number;
}

export const VideoFeedLoading = ({ progress, channelCount }: VideoFeedLoadingProps) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      my: 4 
    }}>
      <CircularProgress variant="determinate" value={progress} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Loading videos from and related to {channelCount} channels... ({progress}%)
      </Typography>
    </Box>
  );
}; 