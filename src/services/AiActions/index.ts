import { AiActionsData } from "./types";
import { summaryAction } from "./SummaryAction";
import { keyPointsAction } from "./KeyPointsAction";


export const aiActions: AiActionsData = {
    'summary': summaryAction,
    'keyPoints': keyPointsAction
}


export * from './types';