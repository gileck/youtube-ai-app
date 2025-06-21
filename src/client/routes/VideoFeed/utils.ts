import { YouTubeVideoSearchResult } from '@/shared/types/youtube';
import { YouTubeSearchFilters } from '../../../apis/youtube/types';
import { loadUserSettings } from '../../utils/userSettingsApi';

// Number of videos per page
export const VIDEOS_PER_PAGE = 20;

// Helper function to convert relative date string to timestamp
export const getDateFromRelativeTime = (relativeTime: string): number => {
  const now = new Date();
  
  // Handle ISO date strings (they might be returned in some cases)
  if (relativeTime.match(/^\d{4}-\d{2}-\d{2}T/)) {
    return new Date(relativeTime).getTime();
  }
  
  // Handle relative time strings
  const minutesMatch = relativeTime.match(/(\d+)\s+minute(s)?\s+ago/);
  if (minutesMatch) {
    const minutes = parseInt(minutesMatch[1], 10);
    return new Date(now.getTime() - minutes * 60 * 1000).getTime();
  }
  
  const hoursMatch = relativeTime.match(/(\d+)\s+hour(s)?\s+ago/);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1], 10);
    return new Date(now.getTime() - hours * 60 * 60 * 1000).getTime();
  }
  
  const daysMatch = relativeTime.match(/(\d+)\s+day(s)?\s+ago/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).getTime();
  }
  
  const weeksMatch = relativeTime.match(/(\d+)\s+week(s)?\s+ago/);
  if (weeksMatch) {
    const weeks = parseInt(weeksMatch[1], 10);
    return new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000).getTime();
  }
  
  const monthsMatch = relativeTime.match(/(\d+)\s+month(s)?\s+ago/);
  if (monthsMatch) {
    const months = parseInt(monthsMatch[1], 10);
    const date = new Date(now);
    date.setMonth(date.getMonth() - months);
    return date.getTime();
  }
  
  const yearsMatch = relativeTime.match(/(\d+)\s+year(s)?\s+ago/);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1], 10);
    const date = new Date(now);
    date.setFullYear(date.getFullYear() - years);
    return date.getTime();
  }
  
  // Handle specific formats like "Jan 1, 2023"
  const specificDateMatch = relativeTime.match(/([A-Za-z]+)\s+(\d+),\s+(\d{4})/);
  if (specificDateMatch) {
    const [month, day, year] = specificDateMatch;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.findIndex(m => m.toLowerCase() === month.toLowerCase());
    if (monthIndex !== -1) {
      return new Date(parseInt(year), monthIndex, parseInt(day)).getTime();
    }
  }
  
  // Default to current time if format is not recognized
  console.warn(`Unrecognized date format: ${relativeTime}`);
  return now.getTime();
};

// Sort videos based on selected sort option
export const sortVideos = (videos: YouTubeVideoSearchResult[], sortBy: string = 'upload_date') => {
  return [...videos].sort((a, b) => {
    if (sortBy === 'upload_date') {
      // Convert published date strings to actual timestamps using our helper function
      const dateA = getDateFromRelativeTime(a.publishedAt);
      const dateB = getDateFromRelativeTime(b.publishedAt);
      return dateB - dateA; // Most recent first
    } else if (sortBy === 'view_count') {
      // Sort by view count (highest first)
      const viewsA = parseInt(a.viewCount || '0', 10);
      const viewsB = parseInt(b.viewCount || '0', 10);
      return viewsB - viewsA;
    }
    return 0;
  });
};

// Get default filters - now async to load from database
export const getDefaultFilters = async (): Promise<YouTubeSearchFilters> => {
  try {
    const userSettings = await loadUserSettings();
    return userSettings.videoFeedFilters;
  } catch (error) {
    console.error('Failed to load video feed filters from database:', error);
    // Fallback to default filters
    return {
      upload_date: 'all',
      type: 'video',
      duration: 'long',
      sort_by: 'upload_date',
      features: [],
      minViews: 0
    };
  }
}; 