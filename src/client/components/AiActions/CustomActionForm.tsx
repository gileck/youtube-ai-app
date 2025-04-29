import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import { CustomActionType, CustomResponseType } from '@/services/AiActions/types';

// LocalStorage key (must match the one in SuggestedQueries)
const STORAGE_KEY = 'savedCustomQueries';

// Max number of queries to save
const MAX_SAVED_QUERIES = 5;

// Helper functions for localStorage
const saveQueryToStorage = (query: {
  query: string;
  responseType: CustomResponseType;
  actionType: CustomActionType;
}) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Get existing queries
    const savedString = localStorage.getItem(STORAGE_KEY);
    const savedQueries = savedString ? JSON.parse(savedString) : [];
    
    // Check if this exact query already exists
    const existingIndex = savedQueries.findIndex((q: { query: string }) => q.query === query.query);
    
    if (existingIndex >= 0) {
      // Remove the existing one
      savedQueries.splice(existingIndex, 1);
    }
    
    // Add new query to the beginning
    const newQuery = {
      id: Date.now().toString(),
      ...query,
      timestamp: Date.now()
    };
    
    savedQueries.unshift(newQuery);
    
    // Limit to MAX_SAVED_QUERIES
    const trimmedQueries = savedQueries.slice(0, MAX_SAVED_QUERIES);
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedQueries));
  } catch (error) {
    console.error('Error saving query to localStorage:', error);
  }
};

interface CustomActionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (params: {
    query: string;
    responseType: CustomResponseType;
    actionType: CustomActionType;
  }) => void;
  initialValues?: {
    query?: string;
    responseType?: CustomResponseType;
    actionType?: CustomActionType;
  };
}

export const CustomActionForm: React.FC<CustomActionFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues
}) => {
  const [query, setQuery] = useState(initialValues?.query || '');
  const [responseType, setResponseType] = useState<CustomResponseType>(initialValues?.responseType || 'text');
  const [actionType, setActionType] = useState<CustomActionType>(initialValues?.actionType || 'combined');
  const [error, setError] = useState('');

  // Update form when initialValues change or when dialog opens
  useEffect(() => {
    if (open && initialValues) {
      setQuery(initialValues.query || '');
      setResponseType(initialValues.responseType || 'text');
      setActionType(initialValues.actionType || 'combined');
    }
  }, [open, initialValues]);

  const handleSubmit = () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }
    
    const queryParams = {
      query,
      responseType,
      actionType
    };
    
    // Save query to localStorage
    saveQueryToStorage(queryParams);
    
    onSubmit(queryParams);
    
    // Don't reset form here since we want to keep values for potential re-edits
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>Custom AI Query</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            autoFocus
            label="Your question or request"
            fullWidth
            multiline
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2 
          }}>
            <FormControl fullWidth sx={{ mb: { xs: 2, sm: 2 } }}>
              <InputLabel>Response Type</InputLabel>
              <Select
                value={responseType}
                label="Response Type"
                onChange={(e) => setResponseType(e.target.value as CustomResponseType)}
              >
                <MenuItem value="text">
                  <Box>
                    <Typography variant="body1">Text</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Paragraphs of explanatory text
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="list">
                  <Box>
                    <Typography variant="body1">List</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bullet points of key information
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: { xs: 2, sm: 2 } }}>
              <InputLabel>Processing Type</InputLabel>
              <Select
                value={actionType}
                label="Processing Type"
                onChange={(e) => setActionType(e.target.value as CustomActionType)}
              >
                <MenuItem value="combined">
                  <Box>
                    <Typography variant="body1">Combined</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Analyze all chapters together for a cohesive response
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="chapters">
                  <Box>
                    <Typography variant="body1">Chapters</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Analyze each chapter individually
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 