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
  useTheme
} from '@mui/material';
import { useRouter } from '../../router';
import { getYouTubeChaptersTranscript } from '../../../apis/youtube/client';
import { CombinedTranscriptChapters } from '../../../server/youtube/chaptersTranscriptService';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Helper function to format seconds to MM:SS
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const VideoChapters = () => {
  const { queryParams, navigate } = useRouter();
  const videoId = queryParams.id as string;
  const [chaptersData, setChaptersData] = useState<CombinedTranscriptChapters | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchChaptersData = async () => {
      if (!videoId) {
        setError('Video ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getYouTubeChaptersTranscript({
          videoId,
          overlapOffsetSeconds: 5
        });

        if (result.data?.error) {
          setError(result.data.error.message);
        } else if (result.data?.data) {
          setChaptersData(result.data.data);
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

  const handleViewVideo = () => {
    if (videoId) {
      navigate(`/video/${videoId}`);
    }
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
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Chapters and Transcript
        </Typography>
        <Typography>{error || 'Data not found'}</Typography>
        {videoId && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={handleViewVideo}
            >
              View Video Details
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '1200px', mx: 'auto' }}>
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Video Chapters & Transcript
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Video ID:
          </Typography>
          <Chip
            label={videoId}
            size="small"
            color="primary"
            variant="outlined"
            onClick={handleViewVideo}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Metadata
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Chip
              icon={<AccessTimeIcon />}
              label={`Duration: ${formatTime(chaptersData.metadata.totalDuration)}`}
              variant="outlined"
            />
            <Chip
              label={`Chapters: ${chaptersData.metadata.chapterCount}`}
              variant="outlined"
            />
            <Chip
              label={`Transcript Items: ${chaptersData.metadata.transcriptItemCount}`}
              variant="outlined"
            />
            <Chip
              label={`Overlap: ${chaptersData.metadata.overlapOffsetSeconds}s`}
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
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`chapter-${index}-content`}
                  id={`chapter-${index}-header`}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Typography sx={{ flexGrow: 1 }}>
                      {chapter.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      {formatTime(chapter.startTime)} - {chapter.endTime === Number.MAX_SAFE_INTEGER
                        ? 'End'
                        : formatTime(chapter.endTime)
                      }
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" gutterBottom>
                    <strong>Content:</strong>
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      backgroundColor: theme.palette.background.default,
                      maxHeight: '300px',
                      overflow: 'auto'
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {chapter.content || 'No content available for this chapter.'}
                    </Typography>
                  </Paper>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Segments ({chapter.segments.length}):</strong>
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: '200px',
                        overflow: 'auto',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        p: 1
                      }}
                    >
                      {chapter.segments.length === 0 ? (
                        <Typography variant="body2">No segments available.</Typography>
                      ) : (
                        chapter.segments.map((segment, segIndex) => (
                          <Box
                            key={segIndex}
                            sx={{
                              mb: 1,
                              p: 1,
                              backgroundColor: segIndex % 2 === 0
                                ? 'rgba(0, 0, 0, 0.03)'
                                : 'transparent',
                              borderRadius: 1
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatTime(segment.start_seconds)} ({segment.end_seconds - segment.start_seconds}s)
                              </Typography>
                              {/* <Typography variant="caption" color="text.secondary">
                                Position: {(segment.relativeOffset * 100).toFixed(0)}%
                              </Typography> */}
                            </Box>
                            <Typography variant="body2">{segment.text}</Typography>
                          </Box>
                        ))
                      )}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};
