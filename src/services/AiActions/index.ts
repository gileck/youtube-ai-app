import { AiActionsData } from "./types";
import { summaryAction } from "./SummaryAction";
import { keyPointsAction } from "./KeyPointsAction";
import { podcastQAAction } from "./PodcastQAAction";


export const aiActions: AiActionsData = {
    'summary': summaryAction,
    'keyPoints': keyPointsAction,
    'podcastQA': podcastQAAction
}


export * from './types';