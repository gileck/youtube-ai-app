import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Chip,
  Tooltip,
  Button,
  Collapse,
  Stack
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { CustomActionType, CustomResponseType } from '@/services/AiActions/types';

// LocalStorage key to match the other components
const STORAGE_KEY = 'savedCustomQueries';

interface SavedQuery {
  id: string;
  query: string;
  responseType: CustomResponseType;
  actionType: CustomActionType;
  timestamp: number;
}

interface PreviousQueriesChipsProps {
  onSelectQuery: (params: {
    query: string;
    responseType: CustomResponseType;
    actionType: CustomActionType;
  }) => void;
  compact?: boolean;
}

export const PreviousQueriesChips: React.FC<PreviousQueriesChipsProps> = ({ 
  onSelectQuery,
  compact = true
}) => {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

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

  // Limit displayed queries based on compact mode
  const displayedQueries = compact ? savedQueries.slice(0, 3) : savedQueries;
  
  return (
    <Box>
      {compact ? (
        // Compact mode: Just show chips inline
        <Stack 
          direction="row" 
          spacing={1} 
          alignItems="center" 
          sx={{ mt: compact ? 2 : 0, overflow: 'auto', flexWrap: 'nowrap' }}
        >
          <Button
            startIcon={<HistoryIcon fontSize="small" />}
            size="small"
            variant="text"
            color="primary"
            onClick={() => setShowHistory(!showHistory)}
            sx={{ 
              minWidth: 'auto', 
              whiteSpace: 'nowrap',
              px: 1
            }}
          >
            {showHistory ? 'Hide history' : 'History'}
          </Button>

          <Collapse in={showHistory} orientation="horizontal" sx={{ display: 'flex' }}>
            <Stack direction="row" spacing={1} sx={{ pl: 1 }}>
              {displayedQueries.map(query => (
                <Tooltip 
                  key={query.id} 
                  title={query.query}
                  placement="top"
                >
                  <Chip
                    label={query.query.length > 20 ? `${query.query.substring(0, 17)}...` : query.query}
                    size="small"
                    variant="outlined"
                    onClick={() => onSelectQuery({
                      query: query.query,
                      responseType: query.responseType,
                      actionType: query.actionType
                    })}
                    sx={{ 
                      maxWidth: '150px',
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
            </Stack>
          </Collapse>
        </Stack>
      ) : (
        // Full mode: Show chips in a wrapping container
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {displayedQueries.map(query => (
            <Tooltip 
              key={query.id} 
              title={query.query.length > 30 ? query.query : ''}
              placement="top"
            >
              <Chip
                label={query.query.length > 30 ? `${query.query.substring(0, 27)}...` : query.query}
                size="medium"
                variant="outlined"
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
      )}
    </Box>
  );
}; 