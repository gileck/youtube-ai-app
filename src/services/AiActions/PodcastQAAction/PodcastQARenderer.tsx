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
import { ActionRendererProps } from '@/services/AiActions/types';
import { PodcastQAResult } from '.';
import ReactMarkdown from 'react-markdown';

/**
 * Renders a list of podcast questions and answers with expandable answers
 * 
 * @param result The podcast Q&A pairs
 */
export const PodcastQARenderer: React.FC<ActionRendererProps<PodcastQAResult>> = ({ result }) => {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const handleToggle = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
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
        {result?.qaPairs?.length > 0 ? (
          result.qaPairs.map((qaPair, index) => (
            <React.Fragment key={index}>
              <ListItem 
                disablePadding
                sx={{ 
                  mb: 0.5,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <ListItemButton onClick={() => handleToggle(index)}>
                  <ListItemText 
                    primary={
                      <Typography fontWeight="medium" color="primary.main">
                        {qaPair.question}
                      </Typography>
                    } 
                  />
                  {expandedItems[index] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>
              <Collapse in={expandedItems[index]} timeout="auto" unmountOnExit>
                <Box 
                  sx={{ 
                    px: 3, 
                    py: 2, 
                    mb: 1.5,
                    bgcolor: 'action.hover',
                    borderRadius: 1
                  }}
                  className="markdown-content"
                >
                  <ReactMarkdown>
                    {qaPair.answer}
                  </ReactMarkdown>
                </Box>
              </Collapse>
              {index < result.qaPairs.length - 1 && (
                <Box sx={{ my: 1 }}>
                  <Divider />
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
