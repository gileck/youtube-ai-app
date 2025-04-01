import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Stack,
  Divider,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Folder as FolderIcon,
  Description as FileIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { 
  listFiles, 
  writeFile, 
  deleteFile, 
  createFolder, 
  deleteFolder,
  getFile
} from '@/apis/fileManagement/client';
import type { FileInfo } from '@/apis/fileManagement/types';

export const FileManager = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
  
  // File view state
  const [viewingFile, setViewingFile] = useState<FileInfo | null>(null);
  const [viewFileContent, setViewFileContent] = useState('');
  const [showViewFileDialog, setShowViewFileDialog] = useState(false);
  const [isJsonContent, setIsJsonContent] = useState(false);
  const [jsonViewTab, setJsonViewTab] = useState(0);
  
  // Delete confirmation state
  const [itemToDelete, setItemToDelete] = useState<FileInfo | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

  // Fetch files from the API
  const fetchFiles = useCallback(async () => {
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
  }, [currentPrefix]);

  // Load files on component mount and when prefix changes
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

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

  // Open file for viewing
  const handleViewFile = async (file: FileInfo) => {
    setViewingFile(file);
    setLoadingFileContent(true);
    setError(null);
    setJsonViewTab(0);
    
    try {
      const response = await getFile(file.key);
      const content = response.data.content;
      setViewFileContent(content);
      
      // Check if content is valid JSON
      try {
        JSON.parse(content);
        setIsJsonContent(true);
      } catch {
        setIsJsonContent(false);
      }
      
      setShowViewFileDialog(true);
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
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          flexWrap: 'wrap',
          overflow: 'auto',
          maxWidth: '100%'
        }}
      >
        <Button 
          variant="text" 
          onClick={() => navigateToBreadcrumb(-1)}
          sx={{ minWidth: 'auto' }}
          startIcon={<HomeIcon />}
        >
          {isMobile ? '' : 'Root'}
        </Button>
        
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <Typography variant="body2" sx={{ mx: 0.5 }}>/</Typography>
            <Button 
              variant="text" 
              onClick={() => navigateToBreadcrumb(index)}
              sx={{ 
                minWidth: 'auto',
                maxWidth: isMobile ? '100px' : 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              <Tooltip title={crumb}>
                <span>{crumb}</span>
              </Tooltip>
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

  // Render JSON in a formatted way
  const renderJsonContent = () => {
    try {
      const jsonData = JSON.parse(viewFileContent);
      
      return (
        <Box sx={{ mt: 2 }}>
          <Tabs 
            value={jsonViewTab} 
            onChange={(_, newValue) => setJsonViewTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab label="Formatted" />
            <Tab label="Raw" />
          </Tabs>
          
          {jsonViewTab === 0 ? (
            <Box 
              component="pre" 
              sx={{ 
                p: 2, 
                backgroundColor: theme.palette.grey[100], 
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: isMobile ? '60vh' : '50vh',
                fontSize: '0.875rem',
                '& .json-key': { color: theme.palette.primary.main },
                '& .json-string': { color: theme.palette.success.main },
                '& .json-number': { color: theme.palette.secondary.main },
                '& .json-boolean': { color: theme.palette.warning.main },
                '& .json-null': { color: theme.palette.error.main }
              }}
              dangerouslySetInnerHTML={{
                __html: syntaxHighlightJson(JSON.stringify(jsonData, null, 2))
              }}
            />
          ) : (
            <TextField
              multiline
              rows={isMobile ? 15 : 12}
              fullWidth
              value={viewFileContent}
              InputProps={{ readOnly: true }}
              variant="outlined"
              sx={{ mt: 2 }}
            />
          )}
        </Box>
      );
    } catch (e) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error parsing JSON: {e instanceof Error ? e.message : 'Unknown error'}
        </Alert>
      );
    }
  };

  // Syntax highlighting for JSON
  const syntaxHighlightJson = (json: string) => {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
            match = match.replace(/"/g, '').replace(/:$/, '');
            return `<span class="${cls}">"${match}"</span>:`;
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  return (
    <Paper elevation={0} sx={{ width: '100%', p: { xs: 1, sm: 2 } }}>
      {/* Header with responsive layout */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>File Manager</Typography>
        
        <Stack 
          direction={isMobile ? 'column' : 'row'} 
          spacing={1}
          sx={{ width: '100%' }}
        >
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={fetchFiles}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
          >
            Refresh
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<CreateNewFolderIcon />} 
            onClick={() => setShowNewFolderDialog(true)}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
          >
            New Folder
          </Button>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => setShowNewFileDialog(true)}
            fullWidth={isMobile}
            size={isMobile ? 'small' : 'medium'}
          >
            New File
          </Button>
        </Stack>
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
      <Paper 
        variant="outlined" 
        sx={{ 
          maxHeight: { xs: 'calc(100vh - 300px)', sm: 400 }, 
          overflow: 'auto', 
          mb: 2 
        }}
      >
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
                  sx={{
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    py: isMobile ? 2 : 1
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    width: isMobile ? '100%' : 'auto'
                  }}>
                    <ListItemIcon sx={{ minWidth: isMobile ? 40 : 56 }}>
                      {item.isFolder ? <FolderIcon color="primary" /> : <FileIcon />}
                    </ListItemIcon>
                    
                    <ListItemText 
                      primary={
                        <Typography
                          variant="body1"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: isMobile ? '200px' : '100%'
                          }}
                        >
                          {item.key.split('/').pop() || item.key}
                        </Typography>
                      }
                      secondary={
                        item.isFolder 
                          ? `Folder${item.fileCount !== undefined ? ` (${item.fileCount} files` : ''}${
                              item.size > 0 ? `, ${formatFileSize(item.size)}` : ''
                            }${item.fileCount !== undefined ? ')' : ''}` 
                          : `${formatFileSize(item.size)} • ${new Date(item.lastModified).toLocaleString()}`
                      }
                    />
                  </Box>
                  
                  {isMobile && <Divider sx={{ width: '100%', my: 1 }} />}
                  
                  <Box sx={{ 
                    display: 'flex',
                    ml: isMobile ? 'auto' : 0,
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'flex-end' : 'flex-end'
                  }}>
                    {!item.isFolder && (
                      <>
                        <IconButton
                          aria-label="view"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewFile(item);
                          }}
                          sx={{ mr: 1 }}
                          size={isMobile ? 'small' : 'medium'}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          aria-label="edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFile(item);
                          }}
                          sx={{ mr: 1 }}
                          size={isMobile ? 'small' : 'medium'}
                        >
                          <EditIcon />
                        </IconButton>
                      </>
                    )}
                    <IconButton 
                      aria-label="delete" 
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(item);
                      }}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
          </List>
        )}
      </Paper>
      
      {/* New File Dialog */}
      <Dialog 
        open={showNewFileDialog} 
        onClose={() => setShowNewFileDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
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
            rows={isMobile ? 10 : 6}
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
      <Dialog 
        open={showNewFolderDialog} 
        onClose={() => setShowNewFolderDialog(false)} 
        maxWidth="sm"
        fullScreen={isMobile}
      >
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
        fullScreen={isMobile}
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
              rows={isMobile ? 15 : 12}
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
      
      {/* View File Dialog */}
      <Dialog 
        open={showViewFileDialog} 
        onClose={() => setShowViewFileDialog(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          View File: {viewingFile?.key.split('/').pop()}
        </DialogTitle>
        <DialogContent>
          {loadingFileContent ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            isJsonContent ? (
              renderJsonContent()
            ) : (
              <TextField
                multiline
                rows={isMobile ? 15 : 12}
                fullWidth
                value={viewFileContent}
                InputProps={{ readOnly: true }}
                sx={{ mt: 2 }}
                variant="outlined"
              />
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewFileDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirmDialog}
        onClose={() => setShowDeleteConfirmDialog(false)}
        aria-labelledby="delete-confirm-dialog-title"
        aria-describedby="delete-confirm-dialog-description"
        fullScreen={isMobile}
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
