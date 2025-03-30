import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Home } from '../routes/Home';
import { NotFound } from '../routes/NotFound';
import { AIChat } from '../routes/AIChat';
import { Settings } from '../routes/Settings';
import { FileManager } from '../routes/FileManager';
import { createRoutes } from '../router';
import Layout from '../components/Layout';
import dynamic from 'next/dynamic';
import { SettingsProvider } from '../context/SettingsContext';

const RouterProvider = dynamic(() => import('../router/index').then(module => module.RouterProvider), { ssr: false });

// Define routes
const routes = createRoutes({
  '/': Home,
  '/ai-chat': AIChat,
  '/settings': Settings,
  '/file-manager': FileManager,
  '/not-found': NotFound,
});

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SettingsProvider>
        <RouterProvider routes={routes}>
          {Component => <Layout><Component /></Layout>}
        </RouterProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
