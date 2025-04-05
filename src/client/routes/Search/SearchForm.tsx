import { 
  Box, 
  TextField, 
} from '@mui/material';

interface SearchFormProps {
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.FormEvent) => void;
}

export const SearchForm = ({ 
  searchQuery, 
  onSearchChange, 
  onSearchSubmit 
}: SearchFormProps) => {
  return (
    <Box>
        <Box 
          component="form" 
          onSubmit={onSearchSubmit} 
          sx={{ 
            display: 'flex', 
            flex: { xs: 1, md: 0.6 },
            mx: { xs: 2, md: 0 }
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search"
            value={searchQuery}
            onChange={onSearchChange}
            size="small"
          />
          
        </Box>
    </Box>
  );
};
