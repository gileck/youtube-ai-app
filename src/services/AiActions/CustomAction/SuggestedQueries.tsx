import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Chip,
  Tooltip,
  Collapse
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { CustomActionType, CustomResponseType } from '../types';

// LocalStorage key to store previous queries
const STORAGE_KEY = 'savedCustomQueries';

interface SavedQuery {
  id: string;
  query: string;
  responseType: CustomResponseType;
  actionType: CustomActionType;
  timestamp: number;
}

interface SuggestedQueriesProps {
  onSelectQuery: (query: {
    query: string;
    responseType: CustomResponseType;
    actionType: CustomActionType;
  }) => void;
}

export const SuggestedQueries: React.FC<SuggestedQueriesProps> = ({ onSelectQuery }) => {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Load saved queries from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      const queries = saved ? JSON.parse(saved) : [];
      setSavedQueries(queries);
    }
  }, []);
  
  if (savedQueries.length === 0) {
    return null; // Don't render anything if there are no saved queries
  }
  
  return (
    <Box sx={{ mb: 2, borderBottom: '1px solid', borderBottomColor: 'divider', pb: 2 }}>
      <Box 
        onClick={() => setShowSuggestions(prev => !prev)} 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          mb: 1
        }}
      >
        <HistoryIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="body2" color="text.secondary">
          {showSuggestions ? 'Hide previous queries' : 'Previous queries'} 
        </Typography>
        {showSuggestions ? 
          <KeyboardArrowUpIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} /> : 
          <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
        }
      </Box>
      
      <Collapse in={showSuggestions}>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1, 
          mb: 1, 
          maxWidth: '100%',
          overflow: 'hidden' 
        }}>
          {savedQueries.map(query => (
            <Tooltip 
              key={query.id} 
              title={query.query.length > 30 ? query.query : ''}
              placement="top"
            >
              <Chip
                label={query.query.length > 30 ? `${query.query.substring(0, 27)}...` : query.query}
                size="medium"
                onClick={() => onSelectQuery({
                  query: query.query,
                  responseType: query.responseType,
                  actionType: query.actionType
                })}
                sx={{ 
                  maxWidth: '100%',
                  borderRadius: '16px',
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}; 