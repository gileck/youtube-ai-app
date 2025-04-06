import { Box, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchFormProps {
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent) => void;
  onClearSearch?: () => void;
  placeholder?: string;
}

export const SearchForm = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  placeholder = 'Search for videos...'
}: SearchFormProps) => {
  return (
    <Box 
      component="form" 
      onSubmit={onSearchSubmit}
      sx={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center',
        p: 2,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={searchQuery}
        onChange={onSearchChange}
        sx={{ 
          maxWidth: 600,
          '& .MuiOutlinedInput-root': {
            borderRadius: 28,
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchQuery ? (
            <InputAdornment position="end">
              <IconButton 
                edge="end" 
                onClick={onClearSearch}
                size="small"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
      />
    </Box>
  );
};
