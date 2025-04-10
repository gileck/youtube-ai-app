import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Box,
  SelectChangeEvent,
  TextField
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { Types } from 'youtubei.js';
import { YouTubeSearchFilters } from '../../../../apis/youtube/types';

// Default filter values
const defaultFilters: YouTubeSearchFilters = {
  upload_date: 'all',
  type: 'video',
  duration: 'all',
  sort_by: 'view_count',
  features: [],
  minViews: 0
};

export interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: YouTubeSearchFilters) => void;
  initialFilters?: YouTubeSearchFilters;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  onClose,
  onApplyFilters,
  initialFilters = defaultFilters
}) => {
  // State for filter options
  const [filters, setFilters] = useState<YouTubeSearchFilters>({...initialFilters});
  
  // Update filters when initialFilters changes
  useEffect(() => {
    if (initialFilters) {
      setFilters({...initialFilters});
    }
  }, [initialFilters]);
  
  // Handle filter changes
  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle feature toggles
  const handleFeatureToggle = (feature: Types.Feature) => {
    setFilters(prev => {
      const features = prev.features || [];
      if (features.includes(feature)) {
        return {
          ...prev,
          features: features.filter(f => f !== feature)
        };
      } else {
        return {
          ...prev,
          features: [...features, feature]
        };
      }
    });
  };
  
  // Handle minimum views change
  const handleMinViewsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setFilters(prev => ({
      ...prev,
      minViews: isNaN(value) ? 0 : value
    }));
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({...defaultFilters});
  };
  
  // Handle apply filters
  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        pb: 1
      }}>
        <FilterListIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Advanced Filters</Typography>
      </DialogTitle>
      
      <DialogContent sx={{ py: 2}}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {/* Upload Date Filter */}
          {/* <FormControl fullWidth>
            <InputLabel id="upload-date-label">Upload Date</InputLabel>
            <Select
              labelId="upload-date-label"
              id="upload-date"
              name="upload_date"
              value={filters.upload_date || 'all'}
              label="Upload Date"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">Any time</MenuItem>
              <MenuItem value="hour">Last hour</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This week</MenuItem>
              <MenuItem value="month">This month</MenuItem>
              <MenuItem value="year">This year</MenuItem>
            </Select>
          </FormControl> */}
          
          {/* Type Filter */}
          {/* <FormControl fullWidth>
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              id="type"
              name="type"
              value={filters.type || 'video'}
              label="Type"
              onChange={handleFilterChange}
            >
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="channel">Channel</MenuItem>
              <MenuItem value="playlist">Playlist</MenuItem>
              <MenuItem value="movie">Movie</MenuItem>
            </Select>
          </FormControl> */}
          
          {/* Duration Filter */}
          <FormControl fullWidth>
            <InputLabel id="duration-label">Duration</InputLabel>
            <Select
              labelId="duration-label"
              id="duration"
              name="duration"
              value={filters.duration || 'all'}
              label="Duration"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">Any duration</MenuItem>
              <MenuItem value="short">Short (&lt; 4 minutes)</MenuItem>
              <MenuItem value="medium">Medium (4-20 minutes)</MenuItem>
              <MenuItem value="long">Long (&gt; 20 minutes)</MenuItem>
            </Select>
          </FormControl>
          
          {/* Sort By Filter */}
          <FormControl fullWidth>
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              id="sort-by"
              name="sort_by"
              value={filters.sort_by || 'upload_date'}
              label="Sort By"
              onChange={handleFilterChange}
            >
              {/* <MenuItem value="relevance">Relevance</MenuItem> */}
              {/* <MenuItem value="rating">Rating</MenuItem> */}
              <MenuItem value="upload_date">Upload date</MenuItem>
              <MenuItem value="view_count">View count</MenuItem>
            </Select>
          </FormControl>
          
          {/* Minimum Views Filter */}
          <FormControl fullWidth>
            <TextField
              id="min-views"
              label="Minimum Views"
              type="number"
              value={filters.minViews || 0}
              onChange={handleMinViewsChange}
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
          </FormControl>
          
          <Divider sx={{ my: 1 }} />
          
          {/* Features Filter */}
          {/* <Typography variant="subtitle1" gutterBottom>
            Features
          </Typography>
          
          <FormGroup>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('hd') || false}
                    onChange={() => handleFeatureToggle('hd')}
                  />
                }
                label="HD"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('subtitles') || false}
                    onChange={() => handleFeatureToggle('subtitles')}
                  />
                }
                label="Subtitles/CC"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('creative_commons') || false}
                    onChange={() => handleFeatureToggle('creative_commons')}
                  />
                }
                label="Creative Commons"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('3d') || false}
                    onChange={() => handleFeatureToggle('3d')}
                  />
                }
                label="3D"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('live') || false}
                    onChange={() => handleFeatureToggle('live')}
                  />
                }
                label="Live"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('purchased') || false}
                    onChange={() => handleFeatureToggle('purchased')}
                  />
                }
                label="Purchased"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('4k') || false}
                    onChange={() => handleFeatureToggle('4k')}
                  />
                }
                label="4K"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('360') || false}
                    onChange={() => handleFeatureToggle('360')}
                  />
                }
                label="360°"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('location') || false}
                    onChange={() => handleFeatureToggle('location')}
                  />
                }
                label="Location"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('hdr') || false}
                    onChange={() => handleFeatureToggle('hdr')}
                  />
                }
                label="HDR"
              />
            </Box>
          </FormGroup> */}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        borderTop: 1,
        borderColor: 'divider',
        px: 3,
        py: 2,
        justifyContent: 'space-between'
      }}>
        <Button 
          onClick={handleResetFilters}
          color="inherit"
        >
          Reset
        </Button>
        <Box>
          <Button 
            onClick={onClose}
            color="inherit"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApplyFilters}
            variant="contained"
            color="primary"
          >
            Apply Filters
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
