import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Home } from '../routes/Home';
import { About } from '../routes/About';
import { Contact } from '../routes/Contact';
import { NotFound } from '../routes/NotFound';
import { RouterProvider, createRoutes } from '../router';
import Layout from '../components/Layout';

// Define routes
const routes = createRoutes({
  '/': Home,
  '/about': About,
  '/contact': Contact,
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
