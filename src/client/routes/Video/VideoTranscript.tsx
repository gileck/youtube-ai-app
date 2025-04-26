import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  Card,
  CardContent
} from '@mui/material';
import { getYouTubeChaptersTranscript } from '../../../apis/youtube/client';
import { CombinedTranscriptChapters } from '../../../server/youtube/chaptersTranscriptService';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import SortIcon from '@mui/icons-material/Sort';
import { PlayerAPI } from './Video';

// Helper function to format seconds to H:MM:SS
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

interface VideoTranscriptProps {
  videoId: string;
  playerApi?: PlayerAPI;
}

export const VideoTranscript = ({ videoId }: VideoTranscriptProps) => {
  const [chaptersData, setChaptersData] = useState<CombinedTranscriptChapters | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
  const [expandedContents, setExpandedContents] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchChaptersData = async () => {
      if (!videoId) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getYouTubeChaptersTranscript({
          videoId,
          overlapOffsetSeconds: 5
        });

        if (result.data?.error) {
          setError(result.data.error.message);
        } else if (result.data?.data) {
          setChaptersData(result.data.data);

          // Initialize expanded states
          const chaptersExpanded: Record<number, boolean> = {};
          const contentsExpanded: Record<number, boolean> = {};

          if (result.data.data.chapters) {
            result.data.data.chapters.forEach((_, index) => {
              chaptersExpanded[index] = false;
              contentsExpanded[index] = false;
            });
          }

          setExpandedChapters(chaptersExpanded);
          setExpandedContents(contentsExpanded);
        } else {
          setError('Failed to load chapters and transcript data');
        }
      } catch (err) {
        setError('An error occurred while fetching chapters and transcript data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChaptersData();
  }, [videoId]);

  const handleExpandChapter = (index: number) => {
    setExpandedChapters(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleExpandContent = (index: number) => {
    setExpandedContents(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !chaptersData) {
    return (
      <Box>
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Transcript
        </Typography>
        <Typography>{error || 'No transcript available for this video.'}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Video Transcript
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Chip
            icon={<AccessTimeIcon />}
            label={`Duration: ${formatTime(chaptersData.metadata.totalDuration)}`}
            variant="outlined"
          />
          <Chip
            icon={<SortIcon />}
            label={`Chapters: ${chaptersData.metadata.chapterCount}`}
            variant="outlined"
          />
          <Chip
            icon={<TextSnippetIcon />}
            label={`Transcript Items: ${chaptersData.metadata.transcriptItemCount}`}
            variant="outlined"
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Chapters
      </Typography>

      {chaptersData.chapters.length === 0 ? (
        <Typography variant="body1">No chapters available for this video.</Typography>
      ) : (
        <Box sx={{ mt: 2 }}>
          {chaptersData.chapters.map((chapter, index) => (
            <Accordion
              key={index}
              sx={{
                mb: 1,
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px !important',
                '&:before': {
                  display: 'none',
                },
                overflow: 'hidden'
              }}
              expanded={expandedChapters[index]}
              onChange={() => handleExpandChapter(index)}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`chapter-${index}-content`}
                id={`chapter-${index}-header`}
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  borderBottom: expandedChapters[index] ? '1px solid' : 'none',
                  borderBottomColor: 'divider'
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'space-between'
                }}>
                  <Typography sx={{ fontWeight: 500, flex: 1, mr: 4 }}>
                    {chapter.title}
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: '120px',
                    justifyContent: 'flex-end'
                  }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {formatTime(chapter.startTime)} - {chapter.endTime === Number.MAX_SAFE_INTEGER
                        ? 'End'
                        : formatTime(chapter.endTime)
                      }
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2 }}>
                {chapter.content && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                      Content
                    </Typography>
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        backgroundColor: 'background.default',
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box
                          sx={{
                            position: 'relative',
                            maxHeight: expandedContents[index] ? 'none' : '100px',
                            overflow: expandedContents[index] ? 'visible' : 'hidden',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: 'pre-wrap',
                              lineHeight: 1.6,
                              letterSpacing: '0.01em',
                              color: 'text.primary',
                            }}
                          >
                            {chapter.content}
                          </Typography>

                          {!expandedContents[index] && (
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                height: '70px',
                                background: 'linear-gradient(rgba(255,255,255,0), rgba(255,255,255,0.9) 60%)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                pt: 2
                              }}
                            />
                          )}
                        </Box>

                        {chapter.content && chapter.content.length > 200 && (
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              mt: expandedContents[index] ? 2 : 0,
                            }}
                          >
                            <Button
                              size="small"
                              variant="text"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExpandContent(index);
                              }}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 500,
                                px: 2,
                                borderRadius: 2
                              }}
                            >
                              {expandedContents[index] ? 'Show Less' : 'Show More'}
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                )}

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                    Segments ({chapter.segments.length})
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        maxHeight: '300px',
                        overflow: 'auto',
                        p: 1
                      }}
                    >
                      {chapter.segments.length === 0 ? (
                        <Typography variant="body2" sx={{ p: 1 }}>No segments available.</Typography>
                      ) : (
                        chapter.segments.map((segment, segIndex) => (
                          <Card
                            key={segIndex}
                            variant="outlined"
                            sx={{
                              mb: 1,
                              backgroundColor: segIndex % 2 === 0
                                ? 'rgba(0, 0, 0, 0.02)'
                                : 'transparent',
                              borderRadius: 1,
                              borderColor: 'divider',
                              overflow: 'hidden'
                            }}
                          >
                            <CardContent sx={{ p: '8px !important' }}>
                              <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 0.5,
                                alignItems: 'center'
                              }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, minWidth: '80px' }}>
                                  {formatTime(segment.start_seconds)} ({segment.end_seconds - segment.start_seconds}s)
                                </Typography>
                                {/* <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
                                  Position: {(segment.relativeOffset * 100).toFixed(0)}%
                                </Typography> */}
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  lineHeight: 1.5,
                                  color: 'text.primary'
                                }}
                              >
                                {segment.text}
                              </Typography>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </Box>
                  </Paper>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};
