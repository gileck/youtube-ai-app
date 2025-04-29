import { AiActionsData } from "./types";
import { summaryAction } from "./SummaryAction";
import { keyPointsAction } from "./KeyPointsAction";
import { podcastQAAction } from "./PodcastQAAction";
import { questionDeepDiveAction } from "./questionDeepDiveAction";
import { protocolDeepDiveAction } from "./protocolDeepDiveAction";
import { recommendationsAction } from "./RecommendationsAction";
import { findSegmentAction } from "./FindSegmentAction";
import { customAction } from "./CustomAction";
// import { findSegmentAction } from "./FindSegmentAction";


export * from './types';
export * from './CustomAction';

export const aiActions: AiActionsData = {
    'summary': summaryAction,
    'keyPoints': keyPointsAction,
    'podcastQA': podcastQAAction,
    'questionDeepDive': questionDeepDiveAction,
    'protocolDeepDive': protocolDeepDiveAction,
    'recommendations': recommendationsAction,
    'findSegment': findSegmentAction,
    'custom': customAction
}