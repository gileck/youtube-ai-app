import { VideoActionType } from '@/services/AiActions';

export interface AIVideoActionProps {
    videoId: string;
    actionType: VideoActionType;
} 