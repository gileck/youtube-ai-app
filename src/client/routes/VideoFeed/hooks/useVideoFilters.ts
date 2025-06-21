import { useState, useCallback, useEffect } from 'react';
import { YouTubeSearchFilters } from '../../../../apis/youtube/types';
import { getDefaultFilters } from '../utils';
import { saveVideoFeedFilters } from '../../../utils/userSettingsApi';

export interface VideoFiltersResult {
  filters: YouTubeSearchFilters;
  isFilterDialogOpen: boolean;
  isFiltersLoading: boolean;
  openFilterDialog: () => void;
  closeFilterDialog: () => void;
  applyFilters: (newFilters: YouTubeSearchFilters) => Promise<void>;
}

export const useVideoFilters = (): VideoFiltersResult => {
  // Filter dialog state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  // Loading state for filters
  const [isFiltersLoading, setIsFiltersLoading] = useState(true);
  
  // Advanced filters state with default values
  const [filters, setFilters] = useState<YouTubeSearchFilters>({
    upload_date: 'all',
    type: 'video',
    duration: 'long',
    sort_by: 'upload_date',
    features: [],
    minViews: 0
  });

  // Load filters from database on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const defaultFilters = await getDefaultFilters();
        setFilters(defaultFilters);
      } catch (error) {
        console.error('Failed to load video feed filters:', error);
      } finally {
        setIsFiltersLoading(false);
      }
    };
    loadFilters();
  }, []);

  // Handle filter dialog open
  const openFilterDialog = useCallback(() => {
    setIsFilterDialogOpen(true);
  }, []);
  
  // Handle filter dialog close
  const closeFilterDialog = useCallback(() => {
    setIsFilterDialogOpen(false);
  }, []);
  
  // Handle applying filters
  const applyFilters = useCallback(async (newFilters: YouTubeSearchFilters) => {
    setFilters(newFilters);
    
    // Save to database
    await saveVideoFeedFilters(newFilters);
  }, []);

  return {
    filters,
    isFilterDialogOpen,
    isFiltersLoading,
    openFilterDialog,
    closeFilterDialog,
    applyFilters
  };
}; 