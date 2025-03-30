// Types for file management API

export type FileInfo = {
  key: string;
  size: number;
  lastModified: Date;
  isFolder: boolean;
};

// Base request type
export type FileManagementBaseRequest = {
  action: 'list' | 'write' | 'delete' | 'createFolder' | 'deleteFolder';
};

// List files request
export type ListFilesRequest = FileManagementBaseRequest & {
  action: 'list';
  prefix?: string;
};

// Write file request
export type WriteFileRequest = FileManagementBaseRequest & {
  action: 'write';
  fileName: string;
  content: string;
  contentType?: string;
};

// Delete file request
export type DeleteFileRequest = FileManagementBaseRequest & {
  action: 'delete';
  fileName: string;
};

// Create folder request
export type CreateFolderRequest = FileManagementBaseRequest & {
  action: 'createFolder';
  folderName: string;
};

// Delete folder request
export type DeleteFolderRequest = FileManagementBaseRequest & {
  action: 'deleteFolder';
  folderName: string;
};

// Combined request type
export type FileManagementRequest = 
  | ListFilesRequest
  | WriteFileRequest
  | DeleteFileRequest
  | CreateFolderRequest
  | DeleteFolderRequest;

// Response types
export type ListFilesResponse = {
  files: FileInfo[];
  error?: string;
};

export type WriteFileResponse = {
  key: string;
  error?: string;
};

export type DeleteFileResponse = {
  success: boolean;
  error?: string;
};

export type CreateFolderResponse = {
  key: string;
  error?: string;
};

export type DeleteFolderResponse = {
  success: boolean;
  error?: string;
};

// Combined response type
export type FileManagementResponse = 
  | ListFilesResponse
  | WriteFileResponse
  | DeleteFileResponse
  | CreateFolderResponse
  | DeleteFolderResponse;
