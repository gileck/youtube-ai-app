import { AiActionsData } from "./types";
import { summaryAction } from "./SummaryAction";
import { keyPointsAction } from "./KeyPointsAction";
import { podcastQAAction } from "./PodcastQAAction";
import { questionDeepDiveAction } from "./questionDeepDiveAction";
import { protocolDeepDiveAction } from "./protocolDeepDiveAction";


export const aiActions: AiActionsData = {
    'summary': summaryAction,
    'keyPoints': keyPointsAction,
    'podcastQA': podcastQAAction,
    'questionDeepDive': questionDeepDiveAction,
    'protocolDeepDive': protocolDeepDiveAction
}


export * from './types';