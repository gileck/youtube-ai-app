import { ApiHandlers } from "./types";
import * as chat from "./chat/server";
import * as clearCache from "./settings/clearCache/server";
import * as fileManagement from "./fileManagement/server";
import * as aiUsage from "./monitoring/aiUsage/server";
import * as auth from "./auth/server";

export const apiHandlers: ApiHandlers = {
  // All API handlers now receive two parameters: params and context
  [chat.name]: { process: chat.process as (params: unknown, context: unknown) => Promise<unknown> },
  [clearCache.name]: { process: clearCache.process as (params: unknown, context: unknown) => Promise<unknown> },
  [fileManagement.name]: { process: fileManagement.process as (params: unknown, context: unknown) => Promise<unknown> },

  // Multiple endpoints under aiUsage namespace
  // The API names (all, summary) should be defined in index.ts and re-exported by server.ts
  [aiUsage.all]: { process: aiUsage.getAllUsage as (params: unknown, context: unknown) => Promise<unknown> },
  [aiUsage.summary]: { process: aiUsage.getSummary as (params: unknown, context: unknown) => Promise<unknown> },

  // Auth endpoints - handleApiRequest requires two parameters
  [auth.login]: { process: auth.loginUser as (params: unknown, context: unknown) => Promise<unknown> },
  [auth.register]: { process: auth.registerUser as (params: unknown, context: unknown) => Promise<unknown> },
  [auth.me]: { process: auth.getCurrentUser as (params: unknown, context: unknown) => Promise<unknown> },
  [auth.logout]: { process: auth.logoutUser as (params: unknown, context: unknown) => Promise<unknown> },
  [auth.updateProfile]: { process: auth.updateUserProfile as (params: unknown, context: unknown) => Promise<unknown> },
};
