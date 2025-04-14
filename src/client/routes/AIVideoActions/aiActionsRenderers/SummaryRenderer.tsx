import React from 'react';
import { 
  Box, 
  Paper,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { ActionRendererProps } from './index';

/**
 * Renders a summary with proper markdown formatting
 * 
 * @param result The summary text in markdown format
 */
export const SummaryRenderer: React.FC<ActionRendererProps> = ({ result }) => {
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
      <Box className="markdown-content" sx={{ 
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          mt: 2,
          mb: 1,
          fontWeight: 'bold'
        },
        '& p': {
          mb: 1.5
        },
        '& ul, & ol': {
          pl: 3,
          mb: 1.5
        },
        '& li': {
          mb: 0.5
        },
        '& blockquote': {
          borderLeft: '4px solid',
          borderColor: 'divider',
          pl: 2,
          py: 0.5,
          my: 1.5,
          fontStyle: 'italic'
        },
        '& code': {
          fontFamily: 'monospace',
          bgcolor: 'action.hover',
          px: 0.5,
          borderRadius: 0.5
        },
        '& pre': {
          bgcolor: 'action.hover',
          p: 2,
          borderRadius: 1,
          overflow: 'auto',
          mb: 1.5
        }
      }}>
        <ReactMarkdown>
          {result}
        </ReactMarkdown>
      </Box>
    </Paper>
  );
};

export default SummaryRenderer;
