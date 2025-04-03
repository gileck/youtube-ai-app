import { 
  Box, 
  TextField, 
  InputAdornment, 
  CircularProgress 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchFormProps {
  searchQuery: string;
  isSearching: boolean;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent) => void;
}

export const SearchForm = ({ 
  searchQuery, 
  isSearching, 
  onSearchChange, 
  onSearchSubmit 
}: SearchFormProps) => {
  return (
    <Box component="form" onSubmit={onSearchSubmit} sx={{ mb: 4 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for videos"
        value={searchQuery}
        onChange={onSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: isSearching ? (
            <InputAdornment position="end">
              <CircularProgress size={24} />
            </InputAdornment>
          ) : null,
          sx: { 
            borderRadius: 4,
            bgcolor: 'background.paper',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'divider',
            },
          }
        }}
      />
    </Box>
  );
};
