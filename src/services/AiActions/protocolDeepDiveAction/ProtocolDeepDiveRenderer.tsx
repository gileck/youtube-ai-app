import React from 'react';
import { 
  Box, 
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { 
  InfoOutlined,
  Code as CodeIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { ActionRendererProps } from '@/services/AiActions/types';
import { ProtocolDeepDiveResult } from '.';

/**
 * Renders a protocol deep dive result with explanation, implementation details, and examples
 * 
 * @param props Component props containing result
 */
export const ProtocolDeepDiveRenderer: React.FC<ActionRendererProps<ProtocolDeepDiveResult>> = ({ result }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        bgcolor: 'background.default',
        borderRadius: 2,
        overflow: 'auto'
      }}
    >
      {/* Protocol Title */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <InfoOutlined sx={{ mr: 1, color: 'primary.main' }} />
          {result.protocol}
        </Typography>
      </Box>

      {/* Explanation */}
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: 'primary.light',
          color: 'primary.contrastText'
        }}
      >
        <CardContent>
          <Typography variant="body1">
            {result.explanation}
          </Typography>
        </CardContent>
      </Card>

      {/* Implementation Details Section */}
      <Box sx={{ mb: 3 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 1
          }}
        >
          <CodeIcon sx={{ mr: 1, color: 'secondary.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Implementation Details
          </Typography>
        </Box>
        <List sx={{ pl: 2 }}>
          {result.implementationDetails.map((detail, index) => (
            <ListItem 
              key={index} 
              sx={{ 
                display: 'list-item', 
                listStyleType: 'disc',
                pl: 0,
                py: 0.5
              }}
            >
              <ListItemText primary={detail} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Examples Section */}
      {result.examples.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 1
            }}
          >
            <AssignmentIcon sx={{ mr: 1, color: 'success.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Examples
            </Typography>
          </Box>
          <Box sx={{ pl: 2 }}>
            {result.examples.map((example, index) => (
              <Card 
                key={index} 
                variant="outlined" 
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  borderLeftWidth: 4,
                  borderLeftColor: 'success.main'
                }}
              >
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="body2">
                    {example}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Additional Notes Section */}
      {result.additionalNotes && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Additional Notes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {result.additionalNotes}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ProtocolDeepDiveRenderer;
