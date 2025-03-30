import { 
  FileManagementRequest, 
  FileManagementResponse,
  ListFilesResponse,
  WriteFileResponse,
  DeleteFileResponse,
  CreateFolderResponse,
  DeleteFolderResponse,
  FileInfo
} from "./types";
import { name } from './index';
import {
  uploadFile,
  getFileAsString,
  listFiles,
  deleteFile,
  getS3Client,
  getDefaultBucketName
} from "@/serverUtils/s3/sdk";

export { name };

// Helper function to convert S3 files to FileInfo
const convertToFileInfo = (files: Array<{ key: string; size: number; lastModified: Date }>): FileInfo[] => {
  // Group files by folder
  const filesByFolder: Record<string, FileInfo[]> = {};
  const result: FileInfo[] = [];
  
  // Process files and identify folders
  files.forEach(file => {
    const key = file.key;
    const parts = key.split('/');
    
    // If this is a file in a subfolder
    if (parts.length > 1) {
      const folderPath = parts.slice(0, -1).join('/') + '/';
      
      // Add folder if it doesn't exist in our result
      if (!filesByFolder[folderPath]) {
        filesByFolder[folderPath] = [];
        result.push({
          key: folderPath,
          size: 0,
          lastModified: new Date(),
          isFolder: true
        });
      }
    }
    
    // Add the file itself
    result.push({
      key,
      size: file.size,
      lastModified: file.lastModified,
      isFolder: false
    });
  });
  
  return result;
};

// Process function that handles all file management operations
export const process = async (request: FileManagementRequest): Promise<FileManagementResponse> => {
  try {
    // Input validation
    if (!request.action) {
      return {
        files: [],
        error: "Missing required field: action"
      } as ListFilesResponse;
    }

    // Handle different actions
    switch (request.action) {
      case 'list': {
        const s3Files = await listFiles(request.prefix);
        const files = convertToFileInfo(s3Files);
        return { files } as ListFilesResponse;
      }
      
      case 'write': {
        if (!request.fileName || request.content === undefined) {
          return {
            key: "",
            error: "Missing required fields: fileName and content are required"
          } as WriteFileResponse;
        }
        
        const key = await uploadFile({
          content: request.content,
          fileName: request.fileName,
          contentType: request.contentType
        });
        
        return { key } as WriteFileResponse;
      }
      
      case 'delete': {
        if (!request.fileName) {
          return {
            success: false,
            error: "Missing required field: fileName"
          } as DeleteFileResponse;
        }
        
        await deleteFile(request.fileName);
        return { success: true } as DeleteFileResponse;
      }
      
      case 'createFolder': {
        if (!request.folderName) {
          return {
            key: "",
            error: "Missing required field: folderName"
          } as CreateFolderResponse;
        }
        
        // Folders in S3 are just empty objects with a trailing slash
        const folderKey = request.folderName.endsWith('/') 
          ? request.folderName 
          : `${request.folderName}/`;
          
        const key = await uploadFile({
          content: '',
          fileName: folderKey
        });
        
        return { key } as CreateFolderResponse;
      }
      
      case 'deleteFolder': {
        if (!request.folderName) {
          return {
            success: false,
            error: "Missing required field: folderName"
          } as DeleteFolderResponse;
        }
        
        // Get the folder name with trailing slash
        const folderKey = request.folderName.endsWith('/') 
          ? request.folderName 
          : `${request.folderName}/`;
        
        // List all files in the folder
        const files = await listFiles(folderKey);
        
        // Delete all files in the folder
        for (const file of files) {
          await deleteFile(file.key);
        }
        
        // Delete the folder marker itself
        await deleteFile(folderKey);
        
        return { success: true } as DeleteFolderResponse;
      }
      
      default:
        return {
          files: [],
          error: `Invalid action: ${(request as any).action}`
        } as ListFilesResponse;
    }
  } catch (error) {
    console.error('Error in file management API:', error);
    
    // Return appropriate error response based on the action
    switch (request.action) {
      case 'list':
        return {
          files: [],
          error: error instanceof Error ? error.message : String(error)
        } as ListFilesResponse;
        
      case 'write':
      case 'createFolder':
        return {
          key: "",
          error: error instanceof Error ? error.message : String(error)
        } as WriteFileResponse | CreateFolderResponse;
        
      case 'delete':
      case 'deleteFolder':
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        } as DeleteFileResponse | DeleteFolderResponse;
        
      default:
        return {
          files: [],
          error: error instanceof Error ? error.message : String(error)
        } as ListFilesResponse;
    }
  }
};
