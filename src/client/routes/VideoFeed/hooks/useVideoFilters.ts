import { useState, useCallback } from 'react';
import { YouTubeSearchFilters } from '../../../../apis/youtube/types';
import { FILTERS_STORAGE_KEY, getDefaultFilters } from '../utils';

export interface VideoFiltersResult {
  filters: YouTubeSearchFilters;
  isFilterDialogOpen: boolean;
  openFilterDialog: () => void;
  closeFilterDialog: () => void;
  applyFilters: (newFilters: YouTubeSearchFilters) => void;
}

export const useVideoFilters = (): VideoFiltersResult => {
  // Filter dialog state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  // Advanced filters state
  const [filters, setFilters] = useState<YouTubeSearchFilters>(getDefaultFilters);

  // Handle filter dialog open
  const openFilterDialog = useCallback(() => {
    setIsFilterDialogOpen(true);
  }, []);
  
  // Handle filter dialog close
  const closeFilterDialog = useCallback(() => {
    setIsFilterDialogOpen(false);
  }, []);
  
  // Handle applying filters
  const applyFilters = useCallback((newFilters: YouTubeSearchFilters) => {
    setFilters(newFilters);
    
    // Save to local storage
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(newFilters));
  }, []);

  return {
    filters,
    isFilterDialogOpen,
    openFilterDialog,
    closeFilterDialog,
    applyFilters
  };
}; 