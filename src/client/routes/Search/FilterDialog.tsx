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
import { YouTubeSearchFilters } from '../../../apis/youtube/types';

// Define the filter options type based on the SearchFilters type from youtubei.js
export interface SearchFilterOptions {
  upload_date?: Types.UploadDate;
  type?: Types.SearchType;
  duration?: Types.Duration;
  sort_by?: Types.SortBy;
  features?: Types.Feature[];
  minViews?: number;
}

// Default filter values
const defaultFilters: YouTubeSearchFilters = {
  upload_date: 'all',
  type: 'video',
  duration: 'all',
  sort_by: 'view_count',
  features: [],
  minViews: 0
};

// Local storage key for saving filters
const FILTERS_STORAGE_KEY = 'youtube_search_filters';

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: YouTubeSearchFilters) => void;
  currentFilters: Partial<YouTubeSearchFilters>;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
  open,
  onClose,
  onApplyFilters,
  currentFilters
}) => {
  // Initialize filters with current filters or from local storage or defaults
  const [filters, setFilters] = useState<YouTubeSearchFilters>(() => {
    console.log('Current filters:', currentFilters);
    // Try to get filters from local storage
    const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (savedFilters) {
      try {
        return { ...defaultFilters, ...JSON.parse(savedFilters) };
      } catch (e) {
        console.error('Failed to parse saved filters', e);
      }
    }
    // Fall back to current filters or defaults
    return { ...defaultFilters, ...currentFilters };
  });


  // Update filters when currentFilters change
  useEffect(() => {
    setFilters(prev => ({ ...prev, ...currentFilters }));
  }, [currentFilters]);

  // Handle select changes
  const handleSelectChange = (event: SelectChangeEvent<string>, field: keyof YouTubeSearchFilters) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle feature checkbox changes
  const handleFeatureChange = (feature: Types.Feature) => {
    setFilters(prev => {
      const features = prev.features || [];
      const newFeatures = features.includes(feature)
        ? features.filter(f => f !== feature)
        : [...features, feature];
      
      return {
        ...prev,
        features: newFeatures
      };
    });
  };

  // Handle minimum views change
  const handleMinViewsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      console.log('Minimum views:', value);
      setFilters(prev => ({
        ...prev,
        minViews: value
      }));
    }
  };

  // Handle slider change for minimum views
  // const handleSliderChange = (_event: Event, newValue: number | number[]) => {
  //   setFilters(prev => ({
  //     ...prev,
  //     minViews: newValue as number
  //   }));
  // };

  // // Format view count for display
  // const formatViewCount = (value: number): string => {
  //   if (value === 0) return '0';
  //   if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  //   if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  //   return value.toString();
  // };

  // Apply filters and save to local storage
  const handleApply = () => {
    // Save to local storage
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
    
    // Apply filters
    console.log('Applying filters:', filters);

    onApplyFilters(filters);
    onClose();
  };

  // Reset filters to defaults
  const handleReset = () => {
    setFilters(defaultFilters);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Advanced Search Filters</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Sort By */}
          <FormControl fullWidth>
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              id="sort-by"
              value={filters.sort_by || defaultFilters.sort_by}
              label="Sort By"
              onChange={(e) => handleSelectChange(e, 'sort_by')}
            >
              <MenuItem value="relevance">Relevance</MenuItem>
              <MenuItem value="rating">Rating</MenuItem>
              <MenuItem value="upload_date">Upload Date</MenuItem>
              <MenuItem value="view_count">View Count</MenuItem>
            </Select>
          </FormControl>

          <Divider />

          {/* Minimum Views */}
          <Box>
            {/* <Stack spacing={3} direction="row" alignItems="center" sx={{ mb: 1 }}>
              <Slider
                value={filters.minViews || 0}
                onChange={handleSliderChange}
                aria-labelledby="min-views-slider"
                valueLabelDisplay="auto"
                valueLabelFormat={formatViewCount}
                step={100}
                min={0}
                max={1_000_000}
                marks={[
                  { value: 0, label: '0' },
                  { value: 1000, label: '1K' },
                  { value: 100000, label: '100K' },
                  { value: 1000000, label: '1M' },
                ]}
              />
            </Stack> */}
            <TextField
              label="Minimum Views"
              type="number"
              value={filters.minViews || 0}
              onChange={handleMinViewsChange}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
          </Box>


          {/* Upload Date */}
          <FormControl fullWidth>
            <InputLabel id="upload-date-label">Upload Date</InputLabel>
            <Select
              labelId="upload-date-label"
              id="upload-date"
              value={filters.upload_date || defaultFilters.upload_date}
              label="Upload Date"
              onChange={(e) => handleSelectChange(e, 'upload_date')}
            >
              <MenuItem value="all">Any Time</MenuItem>
              <MenuItem value="hour">Last Hour</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>

          {/* Type */}
          <FormControl fullWidth>
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              labelId="type-label"
              id="type"
              value={filters.type || defaultFilters.type}
              label="Type"
              onChange={(e) => handleSelectChange(e, 'type')}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="channel">Channel</MenuItem>
              <MenuItem value="playlist">Playlist</MenuItem>
              <MenuItem value="movie">Movie</MenuItem>
            </Select>
          </FormControl>

          {/* Duration */}
          <FormControl fullWidth>
            <InputLabel id="duration-label">Duration</InputLabel>
            <Select
              labelId="duration-label"
              id="duration"
              value={filters.duration || defaultFilters.duration}
              label="Duration"
              onChange={(e) => handleSelectChange(e, 'duration')}
            >
              <MenuItem value="all">Any Duration</MenuItem>
              <MenuItem value="short">Short (&lt; 4 minutes)</MenuItem>
              <MenuItem value="medium">Medium (4-20 minutes)</MenuItem>
              <MenuItem value="long">Long (&gt; 20 minutes)</MenuItem>
            </Select>
          </FormControl>

          <Divider />

          {/* Features */}
          <Typography variant="subtitle1" gutterBottom>
            Features
          </Typography>
          <FormGroup>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('hd') || false}
                    onChange={() => handleFeatureChange('hd')}
                  />
                }
                label="HD"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('subtitles') || false}
                    onChange={() => handleFeatureChange('subtitles')}
                  />
                }
                label="Subtitles/CC"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('creative_commons') || false}
                    onChange={() => handleFeatureChange('creative_commons')}
                  />
                }
                label="Creative Commons"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('3d') || false}
                    onChange={() => handleFeatureChange('3d')}
                  />
                }
                label="3D"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('live') || false}
                    onChange={() => handleFeatureChange('live')}
                  />
                }
                label="Live"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('purchased') || false}
                    onChange={() => handleFeatureChange('purchased')}
                  />
                }
                label="Purchased"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('4k') || false}
                    onChange={() => handleFeatureChange('4k')}
                  />
                }
                label="4K"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('360') || false}
                    onChange={() => handleFeatureChange('360')}
                  />
                }
                label="360°"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('location') || false}
                    onChange={() => handleFeatureChange('location')}
                  />
                }
                label="Location"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('hdr') || false}
                    onChange={() => handleFeatureChange('hdr')}
                  />
                }
                label="HDR"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={filters.features?.includes('vr180') || false}
                    onChange={() => handleFeatureChange('vr180')}
                  />
                }
                label="VR180"
              />
            </Box>
          </FormGroup>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="inherit">
          Reset
        </Button>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleApply} color="primary" variant="contained">
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
}
