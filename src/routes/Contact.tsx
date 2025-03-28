import { Box, Typography, Paper, TextField, Button, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export const Contact = () => {
  return (
    <Paper elevation={0} sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Contact Page
      </Typography>
      <Typography variant="body1" paragraph>
        Get in touch with us using the form below:
      </Typography>
      
      <Box component="form" noValidate sx={{ mt: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              required
              fullWidth
              id="name"
              label="Your Name"
              name="name"
              autoComplete="name"
            />
            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
            />
          </Stack>
          <TextField
            required
            fullWidth
            id="subject"
            label="Subject"
            name="subject"
          />
          <TextField
            required
            fullWidth
            name="message"
            label="Your Message"
            id="message"
            multiline
            rows={4}
          />
        </Stack>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          endIcon={<SendIcon />}
        >
          Send Message
        </Button>
      </Box>
    </Paper>
  );
};

export default Contact;
