// Import components from each route
import Home from './home/route';
import NotFound from './not-found/route';
import AIChat from './ai-chat/route';
import Settings from './settings/route';
import FileManager from './file-manager/route';
import AIMonitoring from './ai-monitoring/route';
import { createRoutes } from '../router';

export const routes = createRoutes({
  '/': Home,
  '/ai-chat': AIChat,
  '/settings': Settings,
  '/file-manager': FileManager,
  '/ai-monitoring': AIMonitoring,
  '/not-found': NotFound,
});
