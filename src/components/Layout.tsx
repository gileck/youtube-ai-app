import { ReactNode, useState } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactsIcon from '@mui/icons-material/Contacts';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from '../router';

type NavItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
};

interface NavigatorStandalone {
  standalone?: boolean;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: <HomeIcon /> },
  { path: '/about', label: 'About', icon: <InfoIcon /> },
  { path: '/contact', label: 'Contact', icon: <ContactsIcon /> },
];

export const Layout = ({ children }: { children?: ReactNode }) => {
  const { currentPath, navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isStandalone = typeof window !== 'undefined' && 
    (window.matchMedia('(display-mode: standalone)').matches || 
    (window.navigator as NavigatorStandalone).standalone);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        SPA Router
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton 
              sx={{ textAlign: 'center' }}
              onClick={() => handleNavigation(item.path)}
              selected={currentPath === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      // Add iOS-specific styles when in standalone mode
      ...(isStandalone && isMobile && {
        // Ensure content is below the iOS status bar
        paddingTop: 'env(safe-area-inset-top)',
        // Ensure content is not covered by the home indicator on newer iPhones
        paddingBottom: 'env(safe-area-inset-bottom)',
        // Ensure content is not covered by the notch
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      })
    }}>
      <AppBar 
        position="sticky" 
        component="nav"
        sx={{
          // Improve iOS standalone experience
          ...(isStandalone && {
            WebkitBackdropFilter: 'blur(10px)',
            backdropFilter: 'blur(10px)',
          })
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            SPA Router
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button 
                key={item.path} 
                sx={{ 
                  color: '#fff',
                  backgroundColor: currentPath === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  mx: 0.5
                }}
                startIcon={item.icon}
                onClick={() => handleNavigation(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
      <Container component="main" sx={{ 
        flexGrow: 1, 
        py: 3,
        px: { xs: 2, sm: 3 },
        maxWidth: { xs: '100%', sm: 'md', md: 'lg' },
        // Add iOS momentum scrolling for a more native feel
        WebkitOverflowScrolling: 'touch'
      }}>
        {children}
      </Container>
      <Box component="footer" sx={{ 
        py: 3, 
        px: 2, 
        mt: 'auto', 
        backgroundColor: (theme) => theme.palette.grey[200],
        // Ensure footer is above the home indicator on iOS
        ...(isStandalone && {
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)'
        })
      }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            {new Date().getFullYear()} Custom SPA Router Example
          </Typography>
        </Container>
      </Box>
      
      
    </Box>
  );
};

export default Layout;
