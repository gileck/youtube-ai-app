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
  Divider
} from '@mui/material';
import { ExpandMore, ExpandLess, QuestionAnswer } from '@mui/icons-material';
import { AiActionChaptersOnly } from '@/services/AiActions/types';
import { PodcastQAResult } from '.';
import ReactMarkdown from 'react-markdown';

/**
 * Renders podcast Q&A pairs grouped by chapter (with title/time), then by subject (with emoji), then Q&A pairs.
 */
export const PodcastQARenderer: AiActionChaptersOnly<PodcastQAResult>['rendeder'] = ({ result }) => {
  // Each expanded state is keyed by chapter, subject, and qa index: `${chapterIdx}-${subjectIdx}-${qaIdx}`
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const handleToggle = (chapterIdx: number, subjectIdx: number, qaIdx: number) => {
    const key = `${chapterIdx}-${subjectIdx}-${qaIdx}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
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
        {result?.length > 0 ? (
          result.map((chapter, chapterIdx) => (
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
    </Paper>
  );
};

export default PodcastQARenderer;
