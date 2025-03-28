import { Typography, Paper } from '@mui/material';

export const Home = () => {
  return (
    <Paper elevation={0} sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Home Page
      </Typography>
      <Typography variant="body1" paragraph>
        Welcome to our Single Page Application with a custom router!
      </Typography>
      <Typography variant="body1">
        This is the home page of the application. Use the navigation menu to explore other pages.
      </Typography>
    </Paper>
  );
};

export default Home;
