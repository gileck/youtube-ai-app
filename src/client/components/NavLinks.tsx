import { NavItem } from './layout/types';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import InsightsIcon from '@mui/icons-material/Insights';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

export const navItems: NavItem[] = [ 
    { path: '/search', label: 'Search', icon: <SearchIcon /> },
    { path: '/video-feed', label: 'Video Feed', icon: <VideoLibraryIcon /> },
    { path: '/bookmarks', label: 'Bookmarks', icon: <BookmarkIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  ];
  
  export const menuItems: NavItem[] = [ 
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/search', label: 'Search', icon: <SearchIcon /> },
    { path: '/video-feed', label: 'Video Feed', icon: <VideoLibraryIcon /> },
    { path: '/bookmarks', label: 'Bookmarks', icon: <BookmarkIcon /> },
    { path: '/ai-chat', label: 'AI Chat', icon: <ChatIcon /> },
    { path: '/file-manager', label: 'Files', icon: <FolderIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
    { path: '/ai-monitoring', label: 'AI Monitoring', icon: <InsightsIcon /> },
  ];