import React from 'react';
import { Box, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Renders markdown content with consistent styling
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown 
      components={{
        p: (props) => (
          <Typography variant="body2" sx={{ my: 1 }} {...props} />
        ),
        ul: (props) => (
          <Box component="ul" sx={{ my: 1, pl: 2 }} {...props} />
        ),
        ol: (props) => (
          <Box component="ol" sx={{ my: 1, pl: 2 }} {...props} />
        ),
        li: (props) => (
          <Box component="li" sx={{ mb: 0.5 }}>
            <Typography variant="body2" component="span" {...props} />
          </Box>
        ),
        a: (props) => (
          <Typography 
            variant="body2" 
            component="a" 
            sx={{ 
              color: 'primary.main', 
              textDecoration: 'none', 
              '&:hover': { textDecoration: 'underline' } 
            }} 
            {...props} 
          />
        ),
        code: (props) => (
          <Typography 
            variant="body2" 
            component="code" 
            sx={{ 
              bgcolor: 'rgba(0,0,0,0.04)', 
              p: 0.5, 
              borderRadius: 1,
              fontFamily: 'monospace'
            }} 
            {...props} 
          />
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );
}; 