import React, { useState } from 'react';
import { 
  Typography, 
  Container, 
  Paper, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent, 
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { getAllModels } from '../ai';
import { AIModelDefinition } from '../ai/models';
import { useSettings } from '../context/SettingsContext';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

export function Settings() {
  const { settings, updateSettings, clearCache } = useSettings();
  const [models] = useState<AIModelDefinition[]>(getAllModels());
  const [isClearing, setIsClearing] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleModelChange = (event: SelectChangeEvent) => {
    updateSettings({ aiModel: event.target.value });
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      const result = await clearCache();
      
      setSnackbar({
        open: true,
        message: result.message,
        severity: result.success ? 'success' : 'error'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        severity: 'error'
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Cache Management
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Clear the application cache to fetch fresh data from AI models and external services.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleClearCache}
          disabled={isClearing}
          startIcon={isClearing ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isClearing ? 'Clearing...' : 'Clear Cache'}
        </Button>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          AI Model
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Select the AI model to use for chat and other AI-powered features.
        </Typography>
        
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="ai-model-select-label">AI Model</InputLabel>
          <Select
            labelId="ai-model-select-label"
            id="ai-model-select"
            value={settings.aiModel}
            label="AI Model"
            onChange={handleModelChange}
          >
            {models.map((model) => (
              <MenuItem key={model.id} value={model.id}>
                {model.name} ({model.provider})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
