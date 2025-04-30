import React from 'react';
import { 
  Box, 
  List
} from '@mui/material';
import { ExpandableListItem } from './ExpandableListItem';
import { DetailedItem, ExpandableItem, ExpandedItemsState, VisibleDescriptionsState } from '../types';
import { generateItemId } from '../utils/helpers';
import type { PlayerAPI } from '@/client/routes/Video/Video';

interface DetailedListProps {
  items: DetailedItem[];
  level?: number;
  playerApi?: PlayerAPI;
  expandedItems: ExpandedItemsState;
  visibleDescriptions: VisibleDescriptionsState;
  toggleDescription: (id: string) => void;
  handleExpand: (item: ExpandableItem) => void;
}

/**
 * Renders a list of detailed items with expanding functionality
 */
export const DetailedList: React.FC<DetailedListProps> = ({
  items,
  level = 0,
  playerApi,
  expandedItems,
  visibleDescriptions,
  toggleDescription,
  handleExpand
}) => {
  // Add IDs to items for tracking state
  const itemsWithIds: ExpandableItem[] = items.map((item, index) => ({
    ...item,
    id: generateItemId(item, index)
  }));

  // Function to render nested lists (prevents recursive stack issue)
  const renderNestedList = (nestedItems: DetailedItem[], nestedLevel: number) => (
    <DetailedList
      items={nestedItems}
      level={nestedLevel}
      playerApi={playerApi}
      expandedItems={expandedItems}
      visibleDescriptions={visibleDescriptions}
      toggleDescription={toggleDescription}
      handleExpand={handleExpand}
    />
  );

  return (
    <Box sx={{ 
      borderTop: level === 0 ? '1px solid rgba(0, 0, 0, 0.12)' : 'none', 
      borderBottom: level === 0 ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
      py: 1
    }}>
      <List sx={{ p: 0 }}>
        {itemsWithIds.map((item, index) => {
          const isExpanded = expandedItems[item.id]?.expanded || false;
          const isLoading = expandedItems[item.id]?.loading || false;
          const expandedItemsList = expandedItems[item.id]?.items || [];
          const isDescriptionVisible = visibleDescriptions[item.id] || false;
          
          return (
            <React.Fragment key={item.id}>
              <ExpandableListItem
                item={item}
                index={index}
                totalItems={itemsWithIds.length}
                isExpanded={isExpanded}
                isLoading={isLoading}
                isDescriptionVisible={isDescriptionVisible}
                expandedItems={expandedItemsList}
                level={level}
                playerApi={playerApi}
                toggleDescription={toggleDescription}
                handleExpand={handleExpand}
                renderNestedList={renderNestedList}
              />
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
}; 