export * from './index';

import * as getUserSettingsHandler from './handlers/getUserSettingsHandler';
import * as updateSearchFiltersHandler from './handlers/updateSearchFiltersHandler';
import * as updateVideoFeedFiltersHandler from './handlers/updateVideoFeedFiltersHandler';
import * as updateRecentSearchesHandler from './handlers/updateRecentSearchesHandler';
import { 
  GET_USER_SETTINGS,
  UPDATE_SEARCH_FILTERS,
  UPDATE_VIDEO_FEED_FILTERS,
  UPDATE_RECENT_SEARCHES
} from './index';

export const userSettingsApiHandlers = {
  [GET_USER_SETTINGS]: getUserSettingsHandler,
  [UPDATE_SEARCH_FILTERS]: updateSearchFiltersHandler,
  [UPDATE_VIDEO_FEED_FILTERS]: updateVideoFeedFiltersHandler,
  [UPDATE_RECENT_SEARCHES]: updateRecentSearchesHandler
}; 