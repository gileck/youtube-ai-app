import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  S3ClientConfig,
  ListObjectsV2CommandOutput,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Constants
const APP_FOLDER_PREFIX = 'app/';

// S3 Configuration
export interface S3Config {
  region: string;
  bucketName: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

console.log('AWS_ACCESS_KEY_ID', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY', process.env.AWS_SECRET_ACCESS_KEY);


// Default configuration - uses environment variables
const defaultConfig: S3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  bucketName: process.env.AWS_BUCKET_NAME || 'app-template',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
};

// Types
export interface S3File {
  key: string;
  size: number;
  lastModified: Date;
  url?: string;
}

export interface S3UploadParams {
  content: string | Buffer;
  fileName: string;
  contentType?: string;
}

// Create S3 client with configuration
export const createS3Client = (config: S3Config = defaultConfig): S3Client => {
  const clientConfig: S3ClientConfig = {
    region: config.region,
  };

  if (config.credentials) {
    clientConfig.credentials = {
      accessKeyId: config.credentials.accessKeyId,
      secretAccessKey: config.credentials.secretAccessKey,
    };
  }

  return new S3Client(clientConfig);
};

// Get the default S3 client
export const getS3Client = (): S3Client => {
  return createS3Client();
};

// Get the default bucket name
export const getDefaultBucketName = (): string => {
  return defaultConfig.bucketName;
};

// Upload a file to S3
export const uploadFile = async (
  params: S3UploadParams,
  client: S3Client = getS3Client(),
  bucketName: string = getDefaultBucketName()
): Promise<string> => {
  const key = `${APP_FOLDER_PREFIX}${params.fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: params.content,
    ContentType: params.contentType || 'application/octet-stream',
  });

  await client.send(command);
  return key;
};

// Get a file from S3
export const getFile = async (
  fileName: string,
  client: S3Client = getS3Client(),
  bucketName: string = getDefaultBucketName()
): Promise<GetObjectCommandOutput> => {
  const key = `${APP_FOLDER_PREFIX}${fileName}`;
  
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return client.send(command);
};

// Get a file as a string
export const getFileAsString = async (
  fileName: string,
  client: S3Client = getS3Client(),
  bucketName: string = getDefaultBucketName()
): Promise<string> => {
  const response = await getFile(fileName, client, bucketName);
  
  if (!response.Body) {
    throw new Error('File body is empty');
  }
  
  const streamReader = response.Body.transformToString();
  return streamReader;
};

// List files in the app folder
export const listFiles = async (
  prefix?: string,
  client: S3Client = getS3Client(),
  bucketName: string = getDefaultBucketName()
): Promise<S3File[]> => {
  const fullPrefix = prefix 
    ? `${APP_FOLDER_PREFIX}${prefix}` 
    : APP_FOLDER_PREFIX;
  
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: fullPrefix,
  });

  const response: ListObjectsV2CommandOutput = await client.send(command);
  
  if (!response.Contents) {
    return [];
  }

  return response.Contents
    .filter(item => item.Key && item.Key !== fullPrefix) // Filter out the folder itself
    .map(item => ({
      key: item.Key!.replace(APP_FOLDER_PREFIX, ''), // Remove the prefix for cleaner keys
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
    }));
};

// Generate a pre-signed URL for temporary access
export const getSignedFileUrl = async (
  fileName: string,
  expiresIn = 3600, // Default 1 hour
  client: S3Client = getS3Client(),
  bucketName: string = getDefaultBucketName()
): Promise<string> => {
  const key = `${APP_FOLDER_PREFIX}${fileName}`;
  
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return getSignedUrl(client, command, { expiresIn });
};

// Delete a file from S3
export const deleteFile = async (
  fileName: string,
  client: S3Client = getS3Client(),
  bucketName: string = getDefaultBucketName()
): Promise<void> => {
  const key = `${APP_FOLDER_PREFIX}${fileName}`;
  
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await client.send(command);
};

// List files with signed URLs
export const listFilesWithUrls = async (
  prefix?: string,
  expiresIn = 3600,
  client: S3Client = getS3Client(),
  bucketName: string = getDefaultBucketName()
): Promise<S3File[]> => {
  const files = await listFiles(prefix, client, bucketName);
  
  // Generate signed URLs for each file
  const filesWithUrls = await Promise.all(
    files.map(async (file) => {
      const url = await getSignedFileUrl(
        file.key,
        expiresIn,
        client,
        bucketName
      );
      return { ...file, url };
    })
  );
  
  return filesWithUrls;
};