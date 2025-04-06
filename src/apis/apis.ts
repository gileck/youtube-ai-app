import { ApiHandlers } from "./types";
import * as chat from "./chat/server";
import * as clearCache from "./settings/clearCache/server";
import * as fileManagement from "./fileManagement/server";
import * as aiUsage from "./monitoring/aiUsage/server";
import { searchApiName, videoApiName, channelApiName } from "./youtube/index";
import { searchVideos, getVideoDetails, getChannelVideos } from "./youtube/server";
import { GetAllAIUsageRequest, GetAIUsageSummaryRequest } from "./monitoring/aiUsage/types";
import { 
  YouTubeSearchRequest, 
  YouTubeVideoRequest,  
} from "./youtube/types";
import { YouTubeChannelParams } from "@/server/youtube";


export const apiHandlers: ApiHandlers = {
  [chat.name]: { process: chat.process as (params: unknown) => Promise<unknown>},
  [clearCache.name]: { process: clearCache.process as (params: unknown) => Promise<unknown>},
  [fileManagement.name]: { process: fileManagement.process as (params: unknown) => Promise<unknown>},
  [`${aiUsage.name}/all`]: { 
    process: (params: unknown) => aiUsage.process(
      params as GetAllAIUsageRequest, 
      'all'
    ) as Promise<unknown>
  },
  [`${aiUsage.name}/summary`]: { 
    process: (params: unknown) => aiUsage.process(
      params as GetAIUsageSummaryRequest, 
      'summary'
    ) as Promise<unknown>
  },
  // YouTube API endpoints
  [searchApiName]: { 
    process: (params: unknown) => searchVideos(params as YouTubeSearchRequest) as Promise<unknown>
  },
  [videoApiName]: { 
    process: (params: unknown) => getVideoDetails(params as YouTubeVideoRequest) as Promise<unknown>
  },
  [channelApiName]: { 
    process: (params: unknown) => getChannelVideos(params as YouTubeChannelParams) as Promise<unknown>
  },
};
