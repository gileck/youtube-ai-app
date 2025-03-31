import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Home } from '../client/routes/Home';
import { NotFound } from '../client/routes/NotFound';
import { AIChat } from '../client/routes/AIChat';
import { Settings } from '../client/routes/Settings';
import { FileManager } from '../client/routes/FileManager';
import { createRoutes } from '../client/router';
import Layout from '../client/components/Layout';
import dynamic from 'next/dynamic';
import { SettingsProvider } from '../client/context/SettingsContext';

const RouterProvider = dynamic(() => import('../client/router/index').then(module => module.RouterProvider), { ssr: false });

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
