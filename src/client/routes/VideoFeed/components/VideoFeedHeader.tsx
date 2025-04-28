import { Box, Typography, Button, Tooltip } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

interface VideoFeedHeaderProps {
  channelCount: number;
  onOpenFilters: () => void;
}

export const VideoFeedHeader = ({ channelCount, onOpenFilters }: VideoFeedHeaderProps) => {
  return (
    <>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: 1, 
        borderColor: 'divider',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Video Feed
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Videos from your {channelCount} bookmarked channels
        </Typography>
      </Box>
      
      {/* Filters Button */}
      <Box sx={{ 
        alignItems: 'center', 
        display: 'flex',
        flexDirection: 'column',
        mt: 2
      }}>
        <Tooltip title="Sort and Filter">
          <Button
            color="primary"
            startIcon={<FilterListIcon />}
            onClick={onOpenFilters}
            sx={{ minWidth: 'auto', height: 40 }}
          >
            Filters
          </Button>
        </Tooltip>
      </Box>
    </>
  );
}; 