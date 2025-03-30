import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  ListItemSecondaryAction, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Folder as FolderIcon,
  Description as FileIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  listFiles, 
  writeFile, 
  deleteFile, 
  createFolder, 
  deleteFolder 
} from '@/api/fileManagement/client';
import type { FileInfo } from '@/api/fileManagement/types';

export const FileManager = () => {
  // State
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrefix, setCurrentPrefix] = useState<string>('');
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  
  // File creation state
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  
  // Folder creation state
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);

  // Load files on component mount and when prefix changes
  useEffect(() => {
    fetchFiles();
  }, [currentPrefix]);

  // Fetch files from the API
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await listFiles(currentPrefix);
      setFiles(response.data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle file or folder click
  const handleItemClick = (item: FileInfo) => {
    if (item.isFolder) {
      // Navigate into folder
      const newPrefix = item.key;
      setCurrentPrefix(newPrefix);
      
      // Update breadcrumbs
      const parts = newPrefix.split('/').filter(p => p);
      setBreadcrumbs(parts);
    } else {
      // For files, we could implement a preview or download feature
      // For now, we'll just log the file name
      console.log('File clicked:', item.key);
    }
  };

  // Navigate using breadcrumbs
  const navigateToBreadcrumb = (index: number) => {
    if (index < 0) {
      // Root level
      setCurrentPrefix('');
      setBreadcrumbs([]);
    } else {
      // Navigate to specific breadcrumb
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      const newPrefix = newBreadcrumbs.join('/') + '/';
      setCurrentPrefix(newPrefix);
      setBreadcrumbs(newBreadcrumbs);
    }
  };

  // Create a new file
  const handleCreateFile = async () => {
    if (!newFileName) {
      setError('File name is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const fileName = currentPrefix + newFileName;
      await writeFile(fileName, newFileContent);
      
      // Reset form and refresh files
      setNewFileName('');
      setNewFileContent('');
      setShowNewFileDialog(false);
      fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create file');
      console.error('Error creating file:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new folder
  const handleCreateFolder = async () => {
    if (!newFolderName) {
      setError('Folder name is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const folderName = currentPrefix + newFolderName;
      await createFolder(folderName);
      
      // Reset form and refresh files
      setNewFolderName('');
      setShowNewFolderDialog(false);
      fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder');
      console.error('Error creating folder:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a file or folder
  const handleDelete = async (item: FileInfo) => {
    setLoading(true);
    setError(null);
    
    try {
      if (item.isFolder) {
        await deleteFolder(item.key);
      } else {
        await deleteFile(item.key);
      }
      
      // Refresh files
      fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      console.error('Error deleting item:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render breadcrumbs
  const renderBreadcrumbs = () => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button 
          variant="text" 
          onClick={() => navigateToBreadcrumb(-1)}
          sx={{ minWidth: 'auto' }}
        >
          Root
        </Button>
        
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <Typography variant="body2" sx={{ mx: 1 }}>/</Typography>
            <Button 
              variant="text" 
              onClick={() => navigateToBreadcrumb(index)}
              sx={{ minWidth: 'auto' }}
            >
              {crumb}
            </Button>
          </React.Fragment>
        ))}
      </Box>
    );
  };

  return (
    <Paper elevation={0} sx={{ width: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">File Manager</Typography>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={fetchFiles}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<CreateNewFolderIcon />} 
            onClick={() => setShowNewFolderDialog(true)}
            sx={{ mr: 1 }}
          >
            New Folder
          </Button>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => setShowNewFileDialog(true)}
          >
            New File
          </Button>
        </Box>
      </Box>
      
      {/* Breadcrumbs navigation */}
      {renderBreadcrumbs()}
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* File list */}
      <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : files.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No files or folders found
            </Typography>
          </Box>
        ) : (
          <List>
            {files
              .sort((a, b) => {
                // Sort folders first, then files
                if (a.isFolder && !b.isFolder) return -1;
                if (!a.isFolder && b.isFolder) return 1;
                // Then sort alphabetically
                return a.key.localeCompare(b.key);
              })
              .map((item) => (
                <ListItem 
                  key={item.key} 
                  onClick={() => handleItemClick(item)}
                >
                  <ListItemIcon>
                    {item.isFolder ? <FolderIcon color="primary" /> : <FileIcon />}
                  </ListItemIcon>
                  
                  <ListItemText 
                    primary={item.key.split('/').pop() || item.key} 
                    secondary={
                      item.isFolder 
                        ? 'Folder' 
                        : `${(item.size / 1024).toFixed(2)} KB • ${new Date(item.lastModified).toLocaleString()}`
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
          </List>
        )}
      </Paper>
      
      {/* New File Dialog */}
      <Dialog open={showNewFileDialog} onClose={() => setShowNewFileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            fullWidth
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="File Content"
            multiline
            rows={6}
            fullWidth
            value={newFileContent}
            onChange={(e) => setNewFileContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewFileDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateFile} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onClose={() => setShowNewFolderDialog(false)} maxWidth="sm">
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewFolderDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FileManager;
