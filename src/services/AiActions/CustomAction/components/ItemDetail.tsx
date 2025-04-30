import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Collapse, 
  CircularProgress,
  IconButton
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ExpandableItem } from '../types';
import type { PlayerAPI } from '@/client/routes/Video/Video';
import { findChapterTimestamp } from '../utils/helpers';

interface ItemDetailProps {
  item: ExpandableItem;
  isDescriptionVisible: boolean;
  isExpanded: boolean;
  isLoading: boolean;
  playerApi?: PlayerAPI;
  toggleDescription: (id: string) => void;
  handleExpand: (item: ExpandableItem) => void;
}

/**
 * Renders the content area of an expandable item
 */
export const ItemDetail: React.FC<ItemDetailProps> = ({
  item,
  isDescriptionVisible,
  isExpanded,
  isLoading,
  playerApi,
  toggleDescription,
  handleExpand
}) => {
  // Handle play button click
  const handlePlay = () => {
    if (!playerApi || !item.chapterTitle) return;
    
    // Find the chapter in the video and seek to it
    const chapterTimestamp = findChapterTimestamp(item.chapterTitle);
    if (chapterTimestamp !== undefined) {
      playerApi.seekTo(chapterTimestamp);
      playerApi.play();
    }
  };

  return (
    <Box sx={{ flex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" fontWeight={500}>
          {item.answer}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {item.chapterTitle && (
            <Button 
              startIcon={<PlayArrowIcon />} 
              onClick={handlePlay}
              disabled={!playerApi || !item.chapterTitle}
              size="small"
              sx={{ mr: 1 }}
            >
              Play
            </Button>
          )}
          
          <IconButton 
            size="small" 
            onClick={() => toggleDescription(item.id)}
            aria-label={isDescriptionVisible ? "Hide description" : "Show description"}
          >
            {isDescriptionVisible ? 
              <KeyboardArrowUpIcon fontSize="small" /> : 
              <KeyboardArrowDownIcon fontSize="small" />
            }
          </IconButton>
        </Box>
      </Box>
      
      <Collapse in={isDescriptionVisible}>
        <Box sx={{ mt: 1 }}>
          <MarkdownRenderer content={item.description} />

          {item.chapterTitle && (
            <Typography 
              component="div" 
              variant="caption" 
              color="text.secondary"
              sx={{ mt: 0.5, fontStyle: 'italic' }}
            >
              From: {item.chapterTitle}
            </Typography>
          )}
        </Box>
        
        {/* Expand button moved inside description */}
        <Box sx={{ mt: 2, mb: 1 }}>
          <Button 
            startIcon={isLoading ? <CircularProgress size={16} /> : <ExpandMoreIcon />}
            onClick={() => handleExpand(item)}
            disabled={isLoading}
            color={isExpanded ? "primary" : "inherit"}
            size="small"
            variant="outlined"
          >
            {isExpanded ? "Collapse" : "Expand for more details"}
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
}; 