import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { ActionRendererProps, ChaptersAiActionResult } from '../types';
import { CustomResult } from '.';
import { processAIVideoAction } from '@/apis/aiVideoActions/client';
import { SuggestedQueries } from './SuggestedQueries';
import { DetailedItem, ExpandableItem, ExpandedItemsState, VisibleDescriptionsState } from './types';
import { ContentRenderer } from './components/ContentRenderer';
import { expandItem } from './services/expandItemService';

/**
 * Main component to render custom AI action results
 */
export const CustomRenderer: React.FC<ActionRendererProps<CustomResult | ChaptersAiActionResult<CustomResult>>> = ({ 
  result, 
  videoId, 
  playerApi 
}) => {
  // State to track expanded items (for nested content)
  const [expandedItems, setExpandedItems] = useState<ExpandedItemsState>({});

  // State to track which descriptions are visible
  const [visibleDescriptions, setVisibleDescriptions] = useState<VisibleDescriptionsState>({});

  // Toggle description visibility
  const toggleDescription = (itemId: string) => {
    setVisibleDescriptions(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Handler for expanding items
  const handleExpand = async (item: ExpandableItem) => {
    if (!videoId) return;
    await expandItem(item, videoId, expandedItems, setExpandedItems);
  };

  // Render suggested queries with content
  const renderWithSuggestedQueries = (content: React.ReactNode) => (
    <>
      <SuggestedQueries 
        onSelectQuery={(queryParams) => {
          if (videoId) {
            processAIVideoAction({
              videoId,
              actionType: 'custom',
              actionParams: queryParams
            });
          }
        }}
      />
      {content}
    </>
  );

  // Handle direct array or string result (combined mode)
  if (Array.isArray(result) || typeof result === 'string') {
    return renderWithSuggestedQueries(
      <ContentRenderer
        content={result}
        playerApi={playerApi}
        expandedItems={expandedItems}
        visibleDescriptions={visibleDescriptions}
        toggleDescription={toggleDescription}
        handleExpand={handleExpand}
      />
    );
  }

  // Handle chapter result structure
  if (result && 'chapters' in result && Array.isArray(result.chapters)) {
    // Create a flattened array of all items from all chapters
    const allItems: DetailedItem[] = [];
    
    // Process each chapter
    for (const chapter of result.chapters) {
      if (!chapter.result) continue;
      
      // Process array results
      if (Array.isArray(chapter.result)) {
        // Skip empty arrays
        if (chapter.result.length === 0) continue;
        
        // Try to process as detailed items
        try {
          // Process each item in the chapter results
          for (const item of chapter.result) {
            const detailedItem = item as unknown as DetailedItem;
            allItems.push({
              answer: detailedItem.answer,
              description: detailedItem.description,
              emoji: detailedItem.emoji,
              chapterTitle: detailedItem.chapterTitle || chapter.title
            });
          }
        } catch (error) {
          // Fallback in case of errors processing the array
          allItems.push({
            answer: chapter.title,
            description: 'Error processing this chapter',
            emoji: '⚠️',
            chapterTitle: chapter.title
          });
        }
      }
    }
    
    // Render the combined list
    if (allItems.length > 0) {
      return renderWithSuggestedQueries(
        <ContentRenderer
          content={allItems}
          playerApi={playerApi}
          expandedItems={expandedItems}
          visibleDescriptions={visibleDescriptions}
          toggleDescription={toggleDescription}
          handleExpand={handleExpand}
        />
      );
    } else {
      return renderWithSuggestedQueries(
        <Typography>No items found in chapters</Typography>
      );
    }
  }

  // Handle object result with 'result' property
  if (result && typeof result === 'object' && 'result' in result) {
    return renderWithSuggestedQueries(
      <ContentRenderer
        content={result.result}
        playerApi={playerApi}
        expandedItems={expandedItems}
        visibleDescriptions={visibleDescriptions}
        toggleDescription={toggleDescription}
        handleExpand={handleExpand}
      />
    );
  }

  // Fallback for any other type
  return renderWithSuggestedQueries(
    <ContentRenderer
      content={result}
      playerApi={playerApi}
      expandedItems={expandedItems}
      visibleDescriptions={visibleDescriptions}
      toggleDescription={toggleDescription}
      handleExpand={handleExpand}
    />
  );
}; 