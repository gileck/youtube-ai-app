/**
 * Types for AI Video Actions API
 */

import { VideoActionType } from '../../server/ai/video-actions';

// Request type for AI video actions
export interface AIVideoActionRequest {
  videoId: string;
  actionType: VideoActionType;
  modelId?: string;
}

// Response type for AI video actions
export interface AIVideoActionResponse {
  videoId: string;
  actionType: VideoActionType;
  result: string;
  cost: {
    totalCost: number;
  };
  error?: string;
}
