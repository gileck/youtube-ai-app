import React, { useState } from 'react';
import { Box, Button, Snackbar, Alert, Typography, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Add as AddIcon, Share as ShareIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import usePwaInstall from '../hooks/usePwaInstall';

export const PwaInstallPrompt = () => {
  const { isInstallable, isInstalled, isIos, isInStandaloneMode, promptToInstall } = usePwaInstall();
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [showInstallMessage, setShowInstallMessage] = useState(false);

  // Don't show anything if already in standalone mode or installed
  if (isInStandaloneMode || isInstalled) {
    return null;
  }

  const handleInstallClick = () => {
    if (isIos) {
      setShowIosInstructions(true);
    } else if (isInstallable) {
      promptToInstall();
    } else {
      setShowInstallMessage(true);
    }
  };

  return (
    <>
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleInstallClick}
          sx={{ borderRadius: 28, px: 2 }}
        >
          Add to Home Screen
        </Button>
      </Box>

      {/* iOS Installation Instructions Dialog */}
      <Dialog
        open={showIosInstructions}
        onClose={() => setShowIosInstructions(false)}
        aria-labelledby="ios-install-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="ios-install-dialog-title">
          Install on iOS
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            To install this app on your iOS device:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><ShareIcon /></ListItemIcon>
              <ListItemText primary="1. Tap the Share button in Safari" />
            </ListItem>
            <ListItem>
              <ListItemIcon><AddIcon /></ListItemIcon>
              <ListItemText primary="2. Scroll down and tap 'Add to Home Screen'" />
            </ListItem>
            <ListItem>
              <ListItemIcon><ArrowForwardIcon /></ListItemIcon>
              <ListItemText primary="3. Tap 'Add' in the top-right corner" />
            </ListItem>
          </List>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Box 
              component="img"
              src="/icons/icon-192x192.png" 
              alt="App Icon"
              sx={{ width: 80, height: 80, borderRadius: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowIosInstructions(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Not installable notification */}
      <Snackbar
        open={showInstallMessage}
        autoHideDuration={6000}
        onClose={() => setShowInstallMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowInstallMessage(false)} 
          severity="info"
          sx={{ width: '100%' }}
        >
          This app can be installed from your browser menu
        </Alert>
      </Snackbar>
    </>
  );
};

export default PwaInstallPrompt;
