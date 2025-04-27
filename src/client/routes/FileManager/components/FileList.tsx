import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Typography
} from '@mui/material';
import {
  Folder as FolderIcon,
  Description as FileIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import type { FileInfo } from '@/apis/fileManagement/types';

interface FileListProps {
  files: FileInfo[];
  loading: boolean;
  onNavigateToFolder: (prefix: string, folderName: string) => void;
  onDeleteItem: (file: FileInfo) => void;
  onEditFile: (file: FileInfo) => void;
  onViewFile: (file: FileInfo) => void;
  onCopyFile?: (file: FileInfo) => void;
  onDownloadFile?: (file: FileInfo) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileList = ({
  files,
  loading,
  onNavigateToFolder,
  onDeleteItem,
  onEditFile,
  onViewFile,
  onCopyFile = () => { },
  onDownloadFile = () => { }
}: FileListProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return <CircularProgress />;
  }

  if (files.length === 0) {
    return <div>No files found in this directory.</div>;
  }

  return (
    <List>
      {files.map((file) => {
        // Extract filename from the key
        const keyParts = file.key.split('/');
        const fileName = keyParts[keyParts.length - 1] || file.key;
        // Extract prefix (directory path) from the key
        const prefix = file.key.substring(0, file.key.length - fileName.length);

        return (
          <ListItem
            key={file.key}
            sx={{
              borderBottom: '1px solid #eee',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
              py: isMobile ? 1 : 2,
              px: isMobile ? 1 : 2
            }}
          >
            <ListItemIcon sx={{ minWidth: isMobile ? 36 : 56 }}>
              {file.isFolder ?
                <FolderIcon color="primary" fontSize={isMobile ? "small" : "medium"} /> :
                <FileIcon color="info" fontSize={isMobile ? "small" : "medium"} />
              }
            </ListItemIcon>

            <ListItemText
              primary={
                <Typography variant={isMobile ? "body2" : "body1"}>
                  {fileName}
                </Typography>
              }
              secondary={
                <Typography variant="caption">
                  {file.isFolder ? 'Folder' : `File - ${formatFileSize(file.size)}`}
                </Typography>
              }
              sx={{
                cursor: file.isFolder ? 'pointer' : 'default',
                '& .MuiListItemText-primary': {
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }
              }}
              onClick={() => {
                if (file.isFolder) {
                  onNavigateToFolder(prefix, fileName);
                }
              }}
            />

            <div style={{ display: 'flex', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
              {!file.isFolder && (
                <>
                  <Tooltip title="View">
                    <IconButton
                      onClick={() => onViewFile(file)}
                      size={isMobile ? "small" : "medium"}
                    >
                      <VisibilityIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => onEditFile(file)}
                      size={isMobile ? "small" : "medium"}
                    >
                      <EditIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Copy">
                    <IconButton
                      onClick={() => onCopyFile(file)}
                      size={isMobile ? "small" : "medium"}
                    >
                      <CopyIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download">
                    <IconButton
                      onClick={() => onDownloadFile(file)}
                      size={isMobile ? "small" : "medium"}
                    >
                      <DownloadIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              <Tooltip title="Delete">
                <IconButton
                  onClick={() => onDeleteItem(file)}
                  size={isMobile ? "small" : "medium"}
                >
                  <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              </Tooltip>
            </div>
          </ListItem>
        );
      })}
    </List>
  );
};
