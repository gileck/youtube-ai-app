import { Typography, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CodeIcon from '@mui/icons-material/Code';
import WebIcon from '@mui/icons-material/Web';

export const About = () => {
  return (
    <Paper elevation={0} sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        About Page
      </Typography>
      <Typography variant="body1" paragraph>
        This is a simple SPA (Single Page Application) built with:
      </Typography>
      
      <List>
        <ListItem>
          <ListItemIcon>
            <WebIcon />
          </ListItemIcon>
          <ListItemText primary="Next.js" secondary="React framework for production" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CodeIcon />
          </ListItemIcon>
          <ListItemText primary="Custom Router" secondary="Simple SPA routing implementation" />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText primary="Material-UI" secondary="React component library for UI" />
        </ListItem>
      </List>
      
      <Typography variant="body1" sx={{ mt: 2 }}>
        The application demonstrates a custom router implementation without relying on external routing libraries.
      </Typography>
    </Paper>
  );
};

export default About;
