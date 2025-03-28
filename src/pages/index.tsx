import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Home } from '../routes/Home';
import { About } from '../routes/About';
import { Contact } from '../routes/Contact';
import { NotFound } from '../routes/NotFound';
import { AIChat } from '../routes/AIChat';
import { createRoutes } from '../router';
import Layout from '../components/Layout';
import dynamic from 'next/dynamic';

const RouterProvider = dynamic(() => import('../router/index').then(module => module.RouterProvider), { ssr: false });

// Define routes
const routes = createRoutes({
  '/': Home,
  '/about': About,
  '/contact': Contact,
  '/ai-chat': AIChat,
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
      <RouterProvider routes={routes}>
        {Component => <Layout><Component /></Layout>}
      </RouterProvider>
    </ThemeProvider>
  );
}
