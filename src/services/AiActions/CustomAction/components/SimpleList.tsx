import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText 
} from '@mui/material';

interface SimpleListProps {
  items: string[];
}

/**
 * Renders a simple list of strings
 */
export const SimpleList: React.FC<SimpleListProps> = ({ items }) => {
  return (
    <Box sx={{ 
      borderTop: '1px solid rgba(0, 0, 0, 0.12)', 
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      py: 1
    }}>
      <List sx={{ p: 0 }}>
        {items.map((item, index) => (
          <ListItem 
            key={index}
            sx={{ 
              py: 1, 
              borderBottom: index < items.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none'
            }}
          >
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 