import { Home } from './Home';
import { NotFound } from './NotFound';
import { AIChat } from './AIChat';
import { Settings } from './Settings';
import { FileManager } from './FileManager';
import { AIMonitoring } from './AIMonitoring';
import { Search } from './Search';
import { Channel } from './Channel';
import { Bookmarks } from './Bookmarks';
import { Video } from './Video';
import { VideoFeed } from './VideoFeed';
import { createRoutes } from '../router';

// Define routes
export const routes = createRoutes({
  '/': Home,
  '/ai-chat': AIChat,
  '/settings': Settings,
  '/file-manager': FileManager,
  '/ai-monitoring': AIMonitoring,
  '/search': Search,
  '/channel/:id': Channel,
  '/video/:id': Video,
  '/bookmarks': Bookmarks,
  '/video-feed': VideoFeed,
  '/not-found': NotFound,
});
