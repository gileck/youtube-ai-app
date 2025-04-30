import React from 'react';
import { 
  Box, 
  ListItem, 
  ListItemIcon,
  Typography, 
  Collapse,
  CircularProgress
} from '@mui/material';
import { ItemDetail } from './ItemDetail';
import { DetailedItem, ExpandableItem } from '../types';
import type { PlayerAPI } from '@/client/routes/Video/Video';

interface ExpandableListItemProps {
  item: ExpandableItem;
  index: number;
  totalItems: number;
  isExpanded: boolean;
  isLoading: boolean;
  isDescriptionVisible: boolean;
  expandedItems: DetailedItem[];
  level: number;
  playerApi?: PlayerAPI;
  toggleDescription: (id: string) => void;
  handleExpand: (item: ExpandableItem) => void;
  renderNestedList: (items: DetailedItem[], level: number) => React.ReactNode;
}

/**
 * A list item that can be expanded to show nested content
 */
export const ExpandableListItem: React.FC<ExpandableListItemProps> = ({
  item,
  index,
  totalItems,
  isExpanded,
  isLoading,
  isDescriptionVisible,
  expandedItems,
  level,
  playerApi,
  toggleDescription,
  handleExpand,
  renderNestedList
}) => {
  return (
    <ListItem 
      sx={{ 
        py: 1.5, 
        borderBottom: index < totalItems - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}
    >
      <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
        <ListItemIcon sx={{ fontSize: '1.5rem', minWidth: 40, mt: 0.5 }}>
          {item.emoji}
        </ListItemIcon>
        
        <ItemDetail 
          item={item}
          isDescriptionVisible={isDescriptionVisible}
          isExpanded={isExpanded}
          isLoading={isLoading}
          playerApi={playerApi}
          toggleDescription={toggleDescription}
          handleExpand={handleExpand}
        />
      </Box>
      
      {/* Nested items - keeping this outside the description box */}
      <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ width: '100%', pl: 4, mt: 1 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : expandedItems.length > 0 ? (
          <Box sx={{ borderLeft: '2px solid rgba(0, 0, 0, 0.08)', pl: 2 }}>
            {renderNestedList(expandedItems, level + 1)}
          </Box>
        ) : isExpanded ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No additional details available.
          </Typography>
        ) : null}
      </Collapse>
    </ListItem>
  );
}; 