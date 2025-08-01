import { NavItem } from './layout/types';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import SummarizeIcon from '@mui/icons-material/Summarize';

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
    { path: '/video-chapters', label: 'Video Chapters', icon: <SubtitlesIcon /> },
    { path: '/ai-video-actions', label: 'AI Video Actions', icon: <SummarizeIcon /> },
    { path: '/bookmarks', label: 'Bookmarks', icon: <BookmarkIcon /> },
    { path: '/ai-chat', label: 'AI Chat', icon: <ChatIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  ];
