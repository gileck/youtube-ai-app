import { Home } from './Home';
import { NotFound } from './NotFound';
import { AIChat } from './AIChat';
import { Settings } from './Settings';
import { Search } from './Search';
import { Channel } from './Channel';
import { Bookmarks } from './Bookmarks';
import { Video } from './Video';
import { VideoFeed } from './VideoFeed';
import { VideoChapters } from './VideoChapters';
import { createRoutes } from '../router';
import { Profile } from './Profile';

// Define routes
export const routes = createRoutes({
  '/': Home,
  '/ai-chat': AIChat,
  '/settings': Settings,
  '/search': Search,
  '/channel/:id': Channel,
  '/video/:id': Video,
  '/video/:id/:tab': Video,
  '/video-chapters': VideoChapters,
  '/bookmarks': Bookmarks,
  '/video-feed': VideoFeed,
  '/not-found': NotFound,
  '/profile': Profile,
});
