import React from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { ActionRendererProps } from '../types';
import { SegmentResult } from '../types';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

export const FindSegmentRenderer: React.FC<ActionRendererProps<SegmentResult>> = ({ result, videoId, playerApi }) => {
    if (!result) {
        return (
            <Box>
                <Typography>No relevant segment found.</Typography>
            </Box>
        );
    }

    // Format time for display (convert seconds to MM:SS format)
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Calculate YouTube URLs client-side
    const conversationTimestamp = result.conversation_start_seconds - 5; // Start 5 seconds earlier
    const relevantSegmentTimestamp = result.relevant_segment_seconds;

    const handlePlayInPlayer = (timestamp: number) => {
        if (playerApi) {
            playerApi.seekTo(timestamp);
            playerApi.play();
        }
    };

    const handleOpenInYouTube = (timestamp: number) => {
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(timestamp)}s`;
        window.open(youtubeUrl, '_blank');
    };

    return (
        <Box>
            <Typography variant="subtitle1" gutterBottom>
                Found Segments
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Start of conversation: {formatTime(conversationTimestamp)}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<PlayCircleOutlineIcon />}
                            onClick={() => handlePlayInPlayer(conversationTimestamp)}
                        >
                            Play from beginning
                        </Button>
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => handleOpenInYouTube(conversationTimestamp)}
                        >
                            YouTube
                        </Button>
                    </Stack>
                </Box>

                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Most relevant point: {formatTime(relevantSegmentTimestamp)}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<OpenInNewIcon />}
                            onClick={() => handlePlayInPlayer(relevantSegmentTimestamp)}
                        >
                            Jump to key moment
                        </Button>
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => handleOpenInYouTube(relevantSegmentTimestamp)}
                        >
                            YouTube
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}; 