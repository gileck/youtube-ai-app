// Re-export all exports from index.ts (required by guidelines)
export * from './index';

// Import API name constants from index.ts
import { 
  GET_BOOKMARKS,
  ADD_VIDEO_BOOKMARK,
  REMOVE_VIDEO_BOOKMARK,
  ADD_CHANNEL_BOOKMARK,
  REMOVE_CHANNEL_BOOKMARK
} from './index';

// Import process functions from handlers
import { process as getBookmarksProcess } from './handlers/getBookmarksHandler';
import { process as addVideoBookmarkProcess } from './handlers/addVideoBookmarkHandler';
import { process as removeVideoBookmarkProcess } from './handlers/removeVideoBookmarkHandler';
import { process as addChannelBookmarkProcess } from './handlers/addChannelBookmarkHandler';
import { process as removeChannelBookmarkProcess } from './handlers/removeChannelBookmarkHandler';

// Construct and export consolidated handlers object
export const bookmarksApiHandlers = {
  [GET_BOOKMARKS]: { process: getBookmarksProcess },
  [ADD_VIDEO_BOOKMARK]: { process: addVideoBookmarkProcess },
  [REMOVE_VIDEO_BOOKMARK]: { process: removeVideoBookmarkProcess },
  [ADD_CHANNEL_BOOKMARK]: { process: addChannelBookmarkProcess },
  [REMOVE_CHANNEL_BOOKMARK]: { process: removeChannelBookmarkProcess },
}; 