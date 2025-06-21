import { ApiHandlers, ApiHandlerContext } from "./types";
import * as chat from "./chat/server";
import * as clearCache from "./settings/clearCache/server";
import * as auth from "./auth/server";
import * as aiVideoActions from "./aiVideoActions/server";
import { bookmarksApiHandlers } from "./bookmarks/server";
import { userSettingsApiHandlers } from "./userSettings/server";
import { searchApiName, videoApiName, channelApiName, chaptersTranscriptApiName } from "./youtube/index";
import { searchVideos, getVideoDetails, getChannelVideos, getYouTubeChaptersTranscript } from "./youtube/server";
import { 
  YouTubeSearchRequest, 
  YouTubeVideoRequest,
  YouTubeChaptersTranscriptRequest,
} from "./youtube/types";
import { YouTubeChannelParams } from "@/server/youtube";

export const apiHandlers: ApiHandlers = {
  [chat.name]: { process: chat.process as (params: unknown, context: ApiHandlerContext) => Promise<unknown> },
  [clearCache.name]: { process: clearCache.process as (params: unknown, context: ApiHandlerContext) => Promise<unknown> },
  [auth.login]: { process: auth.loginUser as (params: unknown, context: ApiHandlerContext) => Promise<unknown> },
  [auth.register]: { process: auth.registerUser as (params: unknown, context: ApiHandlerContext) => Promise<unknown> },
  [auth.me]: { process: auth.getCurrentUser as (params: unknown, context: ApiHandlerContext) => Promise<unknown> },
  [auth.logout]: { process: auth.logoutUser as (params: unknown, context: ApiHandlerContext) => Promise<unknown> },
  [auth.updateProfile]: { process: auth.updateUserProfile as (params: unknown, context: ApiHandlerContext) => Promise<unknown> },
  [aiVideoActions.name]: { process: aiVideoActions.process as (params: unknown, context: ApiHandlerContext) => Promise<unknown> },
  // Spread the consolidated bookmarks handlers
  ...Object.entries(bookmarksApiHandlers).reduce(
    (acc, [key, handler]) => {
      acc[key] = {
        process: handler.process as (params: unknown, context: ApiHandlerContext) => Promise<unknown>,
      };
      return acc;
    },
    {} as Record<string, { process: (params: unknown, context: ApiHandlerContext) => Promise<unknown> }>
  ),
  // Spread the consolidated user settings handlers
  ...Object.entries(userSettingsApiHandlers).reduce(
    (acc, [key, handler]) => {
      acc[key] = {
        process: handler.process as (params: unknown, context: ApiHandlerContext) => Promise<unknown>,
      };
      return acc;
    },
    {} as Record<string, { process: (params: unknown, context: ApiHandlerContext) => Promise<unknown> }>
  ),
  // YouTube API endpoints
  [searchApiName]: { 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    process: (params: unknown, context: ApiHandlerContext) => searchVideos(params as YouTubeSearchRequest) as Promise<unknown>
  },
  [videoApiName]: { 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    process: (params: unknown, context: ApiHandlerContext) => getVideoDetails(params as YouTubeVideoRequest) as Promise<unknown>
  },
  [channelApiName]: { 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    process: (params: unknown, context: ApiHandlerContext) => getChannelVideos(params as YouTubeChannelParams) as Promise<unknown>
  },
  [chaptersTranscriptApiName]: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    process: (params: unknown, context: ApiHandlerContext) => getYouTubeChaptersTranscript(params as YouTubeChaptersTranscriptRequest) as Promise<unknown>
  },
};


