import { useCallback } from 'react';
import { Box, Container } from '@mui/material';
import { FilterDialog } from '../../components/youtube/search';
import { useVideoFilters } from './hooks/useVideoFilters';
import { useVideoLoader } from './hooks/useVideoLoader';
import { VideoFeedHeader, VideoFeedLoading, VideoFeedContent } from './components';

export const VideoFeed = () => {
  // Use custom hooks for filter management
  const {
    filters,
    isFilterDialogOpen,
    isFiltersLoading,
    openFilterDialog,
    closeFilterDialog,
    applyFilters
  } = useVideoFilters();

  // Use custom hook for video loading
  const {
    isLoading,
    loadingProgress,
    feedVideos,
    displayedVideos,
    bookmarkedChannels,
    error,
    currentPage,
    totalPages,
    loadChannelVideos,
    setCurrentPage
  } = useVideoLoader(filters, isFiltersLoading);

  // Handle page change
  const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setCurrentPage]);
  
  // Handle applying filters
  const handleApplyFilters = useCallback(async (newFilters: typeof filters) => {
    await applyFilters(newFilters);
    loadChannelVideos();
    closeFilterDialog();
  }, [applyFilters, loadChannelVideos, closeFilterDialog]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      p: 0 
    }}>
      {/* Header */}
      <VideoFeedHeader 
        channelCount={bookmarkedChannels.length}
        onOpenFilters={openFilterDialog}
      />
      
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flex: 1, p: 0 }}>
        {isFiltersLoading || isLoading ? (
          <VideoFeedLoading 
            progress={loadingProgress}
            channelCount={bookmarkedChannels.length}
          />
        ) : (
          <VideoFeedContent
            isLoading={isLoading}
            feedVideos={feedVideos}
            displayedVideos={displayedVideos}
            error={error}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </Container>
      
      {/* Filter Dialog */}
      <FilterDialog
        open={isFilterDialogOpen}
        onClose={closeFilterDialog}
        initialFilters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </Box>
  );
};
