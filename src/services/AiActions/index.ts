import { AiActionsData } from "./types";
import { summaryAction } from "./SummaryAction";
import { keyPointsAction } from "./KeyPointsAction";
import { podcastQAAction } from "./PodcastQAAction";
import { questionDeepDiveAction } from "./questionDeepDiveAction";
import { protocolDeepDiveAction } from "./protocolDeepDiveAction";
import { recommendationsAction } from "./RecommendationsAction";
import { findSegmentAction } from "./FindSegmentAction";
// import { findSegmentAction } from "./FindSegmentAction";


export const aiActions: AiActionsData = {
    'summary': summaryAction,
    'keyPoints': keyPointsAction,
    'podcastQA': podcastQAAction,
    'questionDeepDive': questionDeepDiveAction,
    'protocolDeepDive': protocolDeepDiveAction,
    'recommendations': recommendationsAction,
    'findSegment': findSegmentAction
}


export * from './types';