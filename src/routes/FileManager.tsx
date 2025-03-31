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
  DialogContentText,
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
  Refresh as RefreshIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { 
  listFiles, 
  writeFile, 
  deleteFile, 
  createFolder, 
  deleteFolder,
  getFile
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

  // File edit state
  const [editingFile, setEditingFile] = useState<FileInfo | null>(null);
  const [editFileContent, setEditFileContent] = useState('');
  const [showEditFileDialog, setShowEditFileDialog] = useState(false);
  const [loadingFileContent, setLoadingFileContent] = useState(false);
  
  // Delete confirmation state
  const [itemToDelete, setItemToDelete] = useState<FileInfo | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

  // Load files on component mount and when prefix changes
  useEffect(() => {
    fetchFiles();
  }, [currentPrefix]);

  // Fetch files from the API
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching files with prefix:', currentPrefix);
      const response = await listFiles(currentPrefix);
      console.log('API response:', response);
      setFiles(response.data.files || []);
      console.log('Files state updated:', response.data.files);
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
      // console.log('File clicked:', item.key);
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

  // Show delete confirmation dialog
  const confirmDelete = (item: FileInfo) => {
    setItemToDelete(item);
    setShowDeleteConfirmDialog(true);
  };

  // Delete a file or folder after confirmation
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    setLoading(true);
    setError(null);
    setShowDeleteConfirmDialog(false);
    
    try {
      if (itemToDelete.isFolder) {
        await deleteFolder(itemToDelete.key);
      } else {
        await deleteFile(itemToDelete.key);
      }
      
      // Refresh files
      fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      console.error('Error deleting item:', err);
    } finally {
      setLoading(false);
      setItemToDelete(null);
    }
  };

  // Open file for editing
  const handleEditFile = async (file: FileInfo) => {
    setEditingFile(file);
    setLoadingFileContent(true);
    setError(null);
    
    try {
      const response = await getFile(file.key);
      setEditFileContent(response.data.content);
      setShowEditFileDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file content');
      console.error('Error loading file content:', err);
    } finally {
      setLoadingFileContent(false);
    }
  };

  // Save edited file
  const handleSaveFile = async () => {
    if (!editingFile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await writeFile(editingFile.key, editFileContent);
      setShowEditFileDialog(false);
      fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file');
      console.error('Error saving file:', err);
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

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} bytes`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else if (size < 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
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
                        ? `Folder${item.fileCount !== undefined ? ` (${item.fileCount} files` : ''}${
                            item.size > 0 ? `, ${formatFileSize(item.size)}` : ''
                          }${item.fileCount !== undefined ? ')' : ''}` 
                        : `${formatFileSize(item.size)} • ${new Date(item.lastModified).toLocaleString()}`
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    {!item.isFolder && (
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFile(item);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton 
                      edge="end" 
                      aria-label="delete" 
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(item);
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

      {/* Edit File Dialog */}
      <Dialog 
        open={showEditFileDialog} 
        onClose={() => setShowEditFileDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Edit File: {editingFile?.key.split('/').pop()}
        </DialogTitle>
        <DialogContent>
          {loadingFileContent ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TextField
              multiline
              rows={12}
              fullWidth
              value={editFileContent}
              onChange={(e) => setEditFileContent(e.target.value)}
              sx={{ mt: 2 }}
              variant="outlined"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditFileDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveFile} 
            variant="contained" 
            disabled={loading || loadingFileContent}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirmDialog}
        onClose={() => setShowDeleteConfirmDialog(false)}
        aria-labelledby="delete-confirm-dialog-title"
        aria-describedby="delete-confirm-dialog-description"
      >
        <DialogTitle id="delete-confirm-dialog-title">
          {itemToDelete?.isFolder ? 'Delete Folder?' : 'Delete File?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-confirm-dialog-description">
            {itemToDelete?.isFolder 
              ? `Are you sure you want to delete the folder "${itemToDelete?.key.split('/').pop()}" and all its contents? This action cannot be undone.`
              : `Are you sure you want to delete the file "${itemToDelete?.key.split('/').pop()}"? This action cannot be undone.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FileManager;
