/**
 * Types for AI video actions
 */
import { CombinedTranscriptChapters } from '../../youtube/chaptersTranscriptService';
import { AIModelAdapterResponse } from '../types';

export type VideoActionType = 'summary' | 'highlights' | 'questions';

export interface VideoActionRequest {
  videoId: string;
  actionType: VideoActionType;
  modelId?: string;
}

export interface VideoActionResponse {
  videoId: string;
  actionType: VideoActionType;
  result: string;
  cost: {
    totalCost: number;
  };
  error?: string;
}

export interface VideoActionHandler {
  process: (
    chaptersData: CombinedTranscriptChapters,
    modelId?: string,
    videoTitle?: string
  ) => Promise<AIModelAdapterResponse<string>>;
}
