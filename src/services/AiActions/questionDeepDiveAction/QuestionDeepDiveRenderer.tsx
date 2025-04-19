import React, { useState } from 'react';
import { 
  Box, 
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FormatQuote as FormatQuoteIcon
} from '@mui/icons-material';
import { ActionRendererProps } from '@/services/AiActions/types';
import { SingleAnswerResult } from '.';

/**
 * Renders a question deep dive result with short answer, detailed points, and supporting quotes
 * 
 * @param props Component props containing result and videoId
 */
export const QuestionDeepDiveRenderer: React.FC<ActionRendererProps<SingleAnswerResult>> = ({ result }) => {
  const [expandedQuotes, setExpandedQuotes] = useState<boolean>(false);
  const [expandedDetails, setExpandedDetails] = useState<boolean>(true);

  const handleToggleQuotes = () => {
    setExpandedQuotes(!expandedQuotes);
  };

  const handleToggleDetails = () => {
    setExpandedDetails(!expandedDetails);
  };

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
      {/* Question */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {result.question}
        </Typography>
      </Box>

      {/* Short Answer */}
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
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {result.shortAnswer}
          </Typography>
        </CardContent>
      </Card>

      {/* Detailed Points Section */}
      <Box sx={{ mb: 3 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 1
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Detailed Points
          </Typography>
          <IconButton 
            onClick={handleToggleDetails} 
            size="small"
            aria-label={expandedDetails ? "collapse details" : "expand details"}
          >
            {expandedDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={expandedDetails}>
          <List sx={{ pl: 2 }}>
            {result.detailedPoints.map((point, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  display: 'list-item', 
                  listStyleType: 'disc',
                  pl: 0,
                  py: 0.5
                }}
              >
                <ListItemText primary={point} />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Box>

      {/* Supporting Quotes Section */}
      {result.quotes.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormatQuoteIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Supporting Quotes
              </Typography>
            </Box>
            <IconButton 
              onClick={handleToggleQuotes} 
              size="small"
              aria-label={expandedQuotes ? "collapse quotes" : "expand quotes"}
            >
              {expandedQuotes ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={expandedQuotes}>
            <Box sx={{ pl: 2 }}>
              {result.quotes.map((quote, index) => (
                <Card 
                  key={index} 
                  variant="outlined" 
                  sx={{ 
                    mb: 2, 
                    borderRadius: 2,
                    borderLeftWidth: 4,
                    borderLeftColor: 'secondary.main'
                  }}
                >
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontStyle: 'italic',
                        color: 'text.secondary'
                      }}
                    >
                      &ldquo;{quote}&rdquo;
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Collapse>
        </Box>
      )}

      {/* Additional Context Section */}
      {result.additionalContext && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Additional Context
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {result.additionalContext}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default QuestionDeepDiveRenderer;
