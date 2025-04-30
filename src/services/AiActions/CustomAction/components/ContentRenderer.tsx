import React from 'react';
import { Typography } from '@mui/material';
import { DetailedList } from './DetailedList';
import { SimpleList } from './SimpleList';
import { DetailedItem, ExpandableItem, ExpandedItemsState, VisibleDescriptionsState } from '../types';
import { isDetailedItemArray } from '../utils/helpers';
import type { PlayerAPI } from '@/client/routes/Video/Video';

interface ContentRendererProps {
  content: any;
  playerApi?: PlayerAPI;
  expandedItems: ExpandedItemsState;
  visibleDescriptions: VisibleDescriptionsState;
  toggleDescription: (id: string) => void;
  handleExpand: (item: ExpandableItem) => void;
}

/**
 * Renders content based on its type (string, string array, or detailed items)
 */
export const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  playerApi,
  expandedItems,
  visibleDescriptions,
  toggleDescription,
  handleExpand
}) => {
  // Handle null or undefined content
  if (content === null || content === undefined) {
    return null;
  }

  // Handle string content
  if (typeof content === 'string') {
    return (
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
        {content}
      </Typography>
    );
  }

  // Handle array content
  if (Array.isArray(content)) {
    // If it looks like a detailed item array
    if (isDetailedItemArray(content)) {
      // Add chapter title to items if provided
      const itemsWithChapter = content.map(item => ({
        ...item,
        chapterTitle: item.chapterTitle 
      }));
      
      return (
        <DetailedList
          items={itemsWithChapter}
          playerApi={playerApi}
          expandedItems={expandedItems}
          visibleDescriptions={visibleDescriptions}
          toggleDescription={toggleDescription}
          handleExpand={handleExpand}
        />
      );
    }
    
    // Otherwise treat as string array
    return <SimpleList items={content.map((item: any) => String(item))} />;
  }

  // Fallback for any other type
  return (
    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(content)}
    </Typography>
  );
}; 