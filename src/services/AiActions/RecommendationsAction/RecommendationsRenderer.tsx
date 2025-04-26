import React, { useState } from 'react';
import {
    Box,
    Paper,
    List,
    ListItem,
    ListItemText,
    Collapse,
    Typography,
    ListItemButton,
    Button,
    CircularProgress
} from '@mui/material';
import { ExpandMore, Recommend } from '@mui/icons-material';
import { ActionRendererProps, ChaptersAiActionResult, SegmentResult } from '@/services/AiActions/types';
import { RecommendationsResult } from '.';
import { processAIVideoAction } from '@/apis/aiVideoActions/client';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

// Time formatting utility function
const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const RecommendationsRenderer: React.FC<ActionRendererProps<ChaptersAiActionResult<RecommendationsResult>>> = ({ result, videoId, playerApi }) => {
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    const [segmentResults, setSegmentResults] = useState<Record<string, SegmentResult | null>>({});
    const [loadingSegments, setLoadingSegments] = useState<Record<string, boolean>>({});

    if (!result.chapters) {
        return null;
    }

    const handleToggle = (itemId: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const handleFindSegment = async (
        chapterTitle: string,
        recommendationTitle: string,
        itemId: string,
        shortDescription: string,
        bypassCache: boolean = false
    ): Promise<SegmentResult | null> => {
        setLoadingSegments(prev => ({ ...prev, [itemId]: true }));

        try {
            const response = await processAIVideoAction({
                videoId,
                actionType: 'findSegment',
                actionParams: {
                    chapterTitle,
                    query: `${recommendationTitle}. ${shortDescription}..`
                } as unknown as Record<string, unknown>
            }, { bypassCache });

            let result: SegmentResult | null = null;
            if (response.data?.result) {
                result = response.data?.result as SegmentResult;
                setSegmentResults(prev => ({
                    ...prev,
                    [itemId]: result
                }));
            } else {
                setSegmentResults(prev => ({ ...prev, [itemId]: null }));
            }
            return result;
        } catch (error) {
            console.error('Error finding segment:', error);
            setSegmentResults(prev => ({ ...prev, [itemId]: null }));
            return null;
        } finally {
            setLoadingSegments(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const handleOpenVideo = (seconds: number, openInYouTube: boolean = false) => {
        if (openInYouTube) {
            // Open in YouTube directly
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(seconds)}s`;
            window.open(videoUrl, '_blank');
        } else if (playerApi) {
            // Use player API
            playerApi.seekTo(seconds);
            playerApi.play();
        }
    };

    // Group recommendations by chapter title
    const recommendationsByChapter: Record<string, Array<{
        title: string;
        emoji: string;
        shortDescription: string;
        detailedDescription: string[];
        chapterTitle: string;
        id: string;
    }>> = {};

    // Flatten all recommendations from all chapters and group by chapter title
    result.chapters.forEach((chapter, chapterIndex) => {
        if (!chapter.result?.recommendations) return;

        chapter.result.recommendations.forEach((rec, recIndex) => {
            const chapterTitle = rec.chapterTitle || chapter.title;
            if (!recommendationsByChapter[chapterTitle]) {
                recommendationsByChapter[chapterTitle] = [];
            }

            recommendationsByChapter[chapterTitle].push({
                ...rec,
                id: `${chapterIndex}-${recIndex}`
            });
        });
    });

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                px: { xs: 0, sm: 3 },
                bgcolor: 'background.default',
                borderRadius: 2,
                overflow: 'auto'
            }}
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Recommend sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="medium">
                    Recommendations & Tools
                </Typography>
            </Box>

            {Object.keys(recommendationsByChapter).length > 0 ? (
                <Box>
                    {Object.entries(recommendationsByChapter).map(([chapterTitle, recommendations], chapterIndex) => (
                        <Box key={chapterIndex} sx={{ mb: 2 }}>
                            {chapterIndex > 0 && (
                                <Box sx={{
                                    position: 'relative',
                                    textAlign: 'center',
                                    my: 2.5,
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: '50%',
                                        left: 0,
                                        right: 0,
                                        height: '1px',
                                        bgcolor: 'divider',
                                        zIndex: 0
                                    }
                                }}>
                                    <Typography
                                        variant="body2"
                                        component="span"
                                        sx={{
                                            position: 'relative',
                                            px: 1.5,
                                            bgcolor: 'background.default',
                                            color: 'text.secondary',
                                            fontSize: '0.775rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            fontWeight: 500,
                                            zIndex: 1
                                        }}
                                    >
                                        {chapterTitle}
                                    </Typography>
                                </Box>
                            )}

                            {chapterIndex === 0 && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 500,
                                        mb: 1,
                                        px: 1,
                                        color: 'text.secondary',
                                        fontSize: '0.775rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    {chapterTitle}
                                </Typography>
                            )}

                            <List
                                sx={{
                                    width: '100%',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    bgcolor: 'background.paper',
                                    '& > li:not(:last-child)': {
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                    }
                                }}
                            >
                                {recommendations.map((rec) => (
                                    <React.Fragment key={rec.id}>
                                        <ListItem
                                            disablePadding
                                            sx={{
                                                bgcolor: 'background.paper',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                }
                                            }}
                                        >
                                            <ListItemButton
                                                onClick={() => handleToggle(rec.id)}
                                                sx={{
                                                    py: 1.5,
                                                    px: 2,
                                                    transition: 'background-color 0.2s',
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography sx={{ fontWeight: 500 }}>
                                                                <Box
                                                                    component="span"
                                                                    mr={1.5}
                                                                    sx={{
                                                                        fontSize: '1.2rem',
                                                                        width: 28,
                                                                        textAlign: 'center'
                                                                    }}
                                                                >
                                                                    {rec.emoji}
                                                                </Box>
                                                                {rec.title}
                                                            </Typography>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                color="primary"
                                                                startIcon={loadingSegments[rec.id] ? <CircularProgress size={16} /> : <PlayCircleOutlineIcon />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (!loadingSegments[rec.id] && !segmentResults[rec.id]) {
                                                                        handleFindSegment(chapterTitle, rec.title, rec.id, rec.shortDescription, false)
                                                                            .then((result) => {
                                                                                if (result) {
                                                                                    setTimeout(() => {
                                                                                        handleOpenVideo(result.conversation_start_seconds - 5);
                                                                                    }, 100);
                                                                                }
                                                                            });
                                                                    } else if (segmentResults[rec.id]) {
                                                                        handleOpenVideo(segmentResults[rec.id]!.conversation_start_seconds - 5);
                                                                    }
                                                                }}
                                                                disabled={loadingSegments[rec.id]}
                                                                sx={{
                                                                    ml: 1,
                                                                    minWidth: 'auto',
                                                                    borderRadius: '20px',
                                                                    fontSize: '0.75rem',
                                                                    textTransform: 'none',
                                                                    '.MuiButton-startIcon': {
                                                                        marginRight: '4px'
                                                                    }
                                                                }}
                                                            >
                                                                {segmentResults[rec.id] ? (
                                                                    formatTime(segmentResults[rec.id]!.conversation_start_seconds - 5)
                                                                ) : (
                                                                    'Play'
                                                                )}
                                                            </Button>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                mt: 0.5,
                                                                color: 'text.secondary',
                                                                fontWeight: 400
                                                            }}
                                                        >
                                                            {rec.shortDescription}
                                                        </Typography>
                                                    }
                                                />
                                                {expandedItems[rec.id] ?
                                                    <ExpandMore sx={{ transform: 'rotate(180deg)', transition: 'transform 0.3s' }} /> :
                                                    <ExpandMore sx={{ transition: 'transform 0.3s' }} />
                                                }
                                            </ListItemButton>
                                        </ListItem>
                                        <Collapse in={expandedItems[rec.id]} timeout="auto" unmountOnExit>
                                            <Box
                                                sx={{
                                                    px: 3,
                                                    py: 2.5,
                                                    bgcolor: 'action.hover',
                                                    borderTop: '1px dashed',
                                                    borderColor: 'divider',
                                                }}
                                            >
                                                <List disablePadding>
                                                    {rec.detailedDescription.map((point, pointIndex) => (
                                                        <ListItem
                                                            key={pointIndex}
                                                            sx={{
                                                                py: 0.75,
                                                                px: 0,
                                                                display: 'flex',
                                                                alignItems: 'flex-start'
                                                            }}
                                                        >
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    mr: 1.5,
                                                                    color: 'primary.main',
                                                                    fontSize: '0.8rem',
                                                                    lineHeight: 2
                                                                }}
                                                            >
                                                                •
                                                            </Box>
                                                            <Typography variant="body2">
                                                                {point}
                                                            </Typography>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                                {segmentResults[rec.id] && (
                                                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                            <Typography variant="subtitle2">
                                                                Found segments for this recommendation
                                                            </Typography>
                                                            <Button
                                                                size="small"
                                                                color="primary"
                                                                variant="text"
                                                                startIcon={loadingSegments[rec.id] ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
                                                                onClick={() => handleFindSegment(chapterTitle, rec.title, rec.id, rec.shortDescription, true)}
                                                                disabled={loadingSegments[rec.id]}
                                                                sx={{ minWidth: 'auto', p: '4px', textTransform: 'none' }}
                                                            >
                                                                Reload
                                                            </Button>
                                                        </Box>

                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                color="primary"
                                                                startIcon={<PlayCircleOutlineIcon />}
                                                                onClick={() => {
                                                                    handleOpenVideo(segmentResults[rec.id]!.conversation_start_seconds - 5);
                                                                }}
                                                                sx={{ textTransform: 'none' }}
                                                            >
                                                                Watch from beginning ({formatTime(segmentResults[rec.id]!.conversation_start_seconds - 5)})
                                                            </Button>

                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                color="primary"
                                                                startIcon={<OpenInNewIcon />}
                                                                onClick={() => {
                                                                    handleOpenVideo(segmentResults[rec.id]!.relevant_segment_seconds);
                                                                }}
                                                                sx={{ textTransform: 'none' }}
                                                            >
                                                                Jump to key moment ({formatTime(segmentResults[rec.id]!.relevant_segment_seconds)})
                                                            </Button>

                                                            <Button
                                                                variant="text"
                                                                size="small"
                                                                sx={{ mt: 1, textTransform: 'none' }}
                                                                onClick={() => {
                                                                    handleOpenVideo(segmentResults[rec.id]!.conversation_start_seconds - 5, true);
                                                                }}
                                                            >
                                                                Open in YouTube
                                                            </Button>
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Collapse>
                                    </React.Fragment>
                                ))}
                            </List>
                        </Box>
                    ))}
                </Box>
            ) : (
                <Typography variant="body1" sx={{ px: 1 }}>No recommendations found in this content.</Typography>
            )}
        </Paper>
    );
}; 