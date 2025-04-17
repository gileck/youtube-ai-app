/**
 * Types for AI Video Actions API
 */

import { VideoActionType } from '@/services/AiActions/index';

// Request type for AI video actions
export interface AIVideoActionRequest {
  videoId: string;
  actionType: VideoActionType;
  modelId?: string;
  actionParams?: Record<string, unknown>;
}

// Response type for AI video actions
export interface AIVideoActionResponse<T> {
  videoId: string;
  actionType: VideoActionType;
  result: T;
  cost: {
    totalCost: number;
  };
  error?: string;
}
