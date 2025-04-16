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
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { ActionRendererProps } from '@/services/AiActions/types';
import { KeyPointsResult } from '.';
import ReactMarkdown from 'react-markdown';

/**
 * Renders a list of key points with expandable descriptions
 * 
 * @param result The key points with title, emoji and description
 */
export const KeyPointsRenderer: React.FC<ActionRendererProps<KeyPointsResult>> = ({ result }) => {
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
      <Typography variant="h6" gutterBottom>
        Key Points
      </Typography>
      <List sx={{ width: '100%' }}>
        {result.keyPoints.map((keyPoint, index) => (
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
                    <Typography>
                      <Box component="span" mr={1}>{keyPoint.emoji}</Box>
                      {keyPoint.title}
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
                  {keyPoint.description}
                </ReactMarkdown>
              </Box>
            </Collapse>
            {index < result.keyPoints.length - 1 && (
              <Box sx={{ my: 1 }}>
                <Divider />
              </Box>
            )}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default KeyPointsRenderer;
