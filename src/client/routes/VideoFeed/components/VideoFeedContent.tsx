import { Box, Pagination } from '@mui/material';
import { SearchResults } from '../../../components/youtube/search';
import { YouTubeVideoSearchResult } from '@/shared/types/youtube';

interface VideoFeedContentProps {
  isLoading: boolean;
  feedVideos: YouTubeVideoSearchResult[];
  displayedVideos: YouTubeVideoSearchResult[];
  error: string | null;
  totalPages: number;
  currentPage: number;
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
}

export const VideoFeedContent = ({
  isLoading,
  feedVideos,
  displayedVideos,
  error,
  totalPages,
  currentPage,
  onPageChange
}: VideoFeedContentProps) => {
  return (
    <>
      <SearchResults
        title={`Videos From and Related to Your Bookmarked Channels (${feedVideos.length})`}
        isSearching={isLoading}
        searchResults={displayedVideos}
        filteredVideos={[]}
        error={error}
        hasMoreResults={false}
        onLoadMore={undefined}
        isLoadingMore={false}
      />
      
      {/* Pagination */}
      {feedVideos.length > 0 && totalPages > 1 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          my: 4 
        }}>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={onPageChange} 
            color="primary" 
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </>
  );
}; 