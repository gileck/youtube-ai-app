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
  Divider,
  Button,
  Dialog,
  DialogContent,
  CircularProgress,
  DialogActions
} from '@mui/material';
import { ExpandMore, ExpandLess, QuestionAnswer, ZoomIn as ZoomInIcon } from '@mui/icons-material';
import { AiActionChaptersOnly } from '@/services/AiActions/types';
import { PodcastQAResult } from '.';
import ReactMarkdown from 'react-markdown';
import { processAIVideoAction } from '@/apis/aiVideoActions/client';
import { QuestionDeepDiveRenderer } from '@/services/AiActions/questionDeepDiveAction/QuestionDeepDiveRenderer';
import { SingleAnswerResult } from '@/services/AiActions/questionDeepDiveAction';

/**
 * Renders podcast Q&A pairs grouped by chapter (with title/time), then by subject (with emoji), then Q&A pairs.
 */
export const PodcastQARenderer: AiActionChaptersOnly<PodcastQAResult>['rendeder'] = ({ result, videoId }) => {
  // Each expanded state is keyed by chapter, subject, and qa index: `${chapterIdx}-${subjectIdx}-${qaIdx}`
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deepDiveResult, setDeepDiveResult] = useState<SingleAnswerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChapter, setCurrentChapter] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');

  const handleToggle = (chapterIdx: number, subjectIdx: number, qaIdx: number) => {
    const key = `${chapterIdx}-${subjectIdx}-${qaIdx}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFullAnswerClick = async (question: string, chapterTitle: string) => {
    setCurrentQuestion(question);
    setCurrentChapter(chapterTitle);
    setDialogOpen(true);
    setLoading(true);
    setError(null);
    setDeepDiveResult(null);

    try {
      const response = await processAIVideoAction({
        videoId,
        actionType: 'questionDeepDive',
        actionParams: {
          question,
          chapterTitle
        }
      });

      if (response.data?.error) {
        setError(response.data.error);
      } else if (response.data) {
        setDeepDiveResult(response.data.result as SingleAnswerResult);
      } else {
        setError('Failed to process the deep dive question. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while processing the deep dive question');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <QuestionAnswer sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">
          Podcast Questions & Answers
        </Typography>
      </Box>
      <List sx={{ width: '100%' }}>
        {result?.chapters?.length > 0 ? (
          result.chapters.map((chapter, chapterIdx) => (
            <React.Fragment key={chapterIdx}>
              {/* Chapter divider: title and time */}
              <Box sx={{ mt: chapterIdx === 0 ? 0 : 3, mb: 1 }}>
                <Divider>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                    {chapter.title}
                  </Typography>
                </Divider>
              </Box>
              {chapter.result?.subjects && chapter.result.subjects.length > 0 ? (
                chapter.result.subjects.map((subject, subjectIdx) => (
                  <React.Fragment key={subjectIdx}>
                    {/* Subject divider: emoji and subject name */}
                    <Box sx={{ mt: 2, mb: 1 }}>
                      <Divider>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                          {subject.emoji} {subject.subject}
                        </Typography>
                      </Divider>
                    </Box>
                    {subject.qaPairs && subject.qaPairs.length > 0 ? (
                      subject.qaPairs.map((qa, qaIdx) => (
                        <React.Fragment key={qaIdx}>
                          <ListItem
                            disablePadding
                            sx={{
                              mb: 0.5,
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                              overflow: 'hidden'
                            }}
                          >
                            <ListItemButton onClick={() => handleToggle(chapterIdx, subjectIdx, qaIdx)}>
                              <ListItemText
                                primary={
                                  <Typography fontWeight="medium" color="text.secondary">
                                    {qa.question}
                                  </Typography>
                                }
                              />
                              {expandedItems[`${chapterIdx}-${subjectIdx}-${qaIdx}`] ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                          </ListItem>
                          <Collapse in={expandedItems[`${chapterIdx}-${subjectIdx}-${qaIdx}`]} timeout="auto" unmountOnExit>
                            <Box
                              sx={{
                                px: 3,
                                py: 2,
                                mb: 1.5,
                                borderRadius: 1
                              }}
                              className="markdown-content"
                            >
                              <ReactMarkdown>
                                {qa.answer}
                              </ReactMarkdown>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button 
                                  variant="outlined" 
                                  size="small" 
                                  startIcon={<ZoomInIcon />}
                                  onClick={() => handleFullAnswerClick(qa.question, chapter.title)}
                                  sx={{ 
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  Full Answer
                                </Button>
                              </Box>
                            </Box>
                          </Collapse>
                        </React.Fragment>
                      ))
                    ) : (
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                          No questions and answers found for this subject.
                        </Typography>
                      </Box>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No subjects found for this chapter.
                  </Typography>
                </Box>
              )}
            </React.Fragment>
          ))
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No questions and answers were found in this content. This might not be a podcast or interview format.
            </Typography>
          </Box>
        )}
      </List>

      {/* Deep Dive Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          p: 2
        }}>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Deep Dive
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {currentQuestion}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              From chapter: {currentChapter}
            </Typography>
          </Box>
        </Box>
        <DialogContent dividers sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3 }}>
              <Typography color="error" gutterBottom>
                Error
              </Typography>
              <Typography>{error}</Typography>
            </Box>
          ) : deepDiveResult ? (
            <QuestionDeepDiveRenderer result={deepDiveResult} videoId={videoId} />
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No detailed answer available.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PodcastQARenderer;
