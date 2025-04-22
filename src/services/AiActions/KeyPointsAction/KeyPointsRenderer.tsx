import React, { useState } from 'react';
import { 
  Box, 
  Paper,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Typography,
  ListItemButton,
  Stack,
  Divider,
  Card,
  CardContent,
  IconButton,
  CircularProgress
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, LightbulbOutlined, FormatListBulleted, InfoOutlined } from '@mui/icons-material';
import { ActionRendererProps, ChaptersAiActionResult } from '@/services/AiActions/types';
import { KeyPointsResult } from '.';
import ReactMarkdown from 'react-markdown';
import { ProtocolDeepDiveResult } from '../protocolDeepDiveAction';
import { processAIVideoAction } from '@/apis/aiVideoActions/client';

/**
 * Renders a list of key points with expandable descriptions and protocols
 * 
 * @param result The key points with title, emoji, description and protocols
 */
export const KeyPointsRenderer: React.FC<ActionRendererProps<ChaptersAiActionResult<KeyPointsResult>>> = ({ result, videoId }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [expandedProtocols, setExpandedProtocols] = useState<Record<string, boolean>>({});
  const [protocolDetails, setProtocolDetails] = useState<Record<string, ProtocolDeepDiveResult | null>>({});
  const [loadingProtocols, setLoadingProtocols] = useState<Record<string, boolean>>({});

  if (!result.chapters) {
    return null;
  }

  const handleToggle = (keyPointId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [keyPointId]: !prev[keyPointId]
    }));
  };

  const handleToggleProtocol = async (protocolId: string, protocol: string, chapterTitle: string) => {
    // Toggle the expanded state
    setExpandedProtocols(prev => ({
      ...prev,
      [protocolId]: !prev[protocolId]
    }));

    // If we're expanding and don't have details yet, fetch them
    if (!expandedProtocols[protocolId] && !protocolDetails[protocolId]) {
      try {
        setLoadingProtocols(prev => ({ ...prev, [protocolId]: true }));
        
        // Use the proper client API function instead of direct fetch
        const response = await processAIVideoAction({
          videoId,
          actionType: 'protocolDeepDive',
          actionParams: {
            protocol,
            chapterTitle
          }
        });

        // Check for errors in the response
        if (response.data.error) {
          throw new Error(response.data.error);
        }

        // Set the protocol details from the response
        setProtocolDetails(prev => ({ 
          ...prev, 
          [protocolId]: response.data.result as ProtocolDeepDiveResult 
        }));
      } catch (error) {
        console.error('Error fetching protocol details:', error);
      } finally {
        setLoadingProtocols(prev => ({ ...prev, [protocolId]: false }));
      }
    }
  };

  // Flatten all key points from all chapters into a single array
  
    
  const allKeyPoints = result.chapters.flatMap(chapter => chapter.result?.keyPoints || []) || [];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        px: { xs: 0, sm: 3 },
        bgcolor: 'background.default',
        borderRadius: 2,
        overflow: 'auto'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <FormatListBulleted sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight="medium">
          Key Points
        </Typography>
      </Box>

      {allKeyPoints.length > 0 ? (
        <List 
          sx={{ 
            width: '100%',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            '& > li:not(:last-child)': {
              borderBottom: '1px solid',
              borderColor: 'divider',
            }
          }}
        >
          {allKeyPoints.map((keyPoint, index) => (
            <React.Fragment key={index}>
              <ListItem 
                disablePadding
                sx={{ 
                  bgcolor: 'background.paper',
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <ListItemButton 
                  onClick={() => handleToggle(`keypoint-${index}`)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    transition: 'background-color 0.2s',
                  }}
                >
                  <ListItemText 
                    primary={
                      <Typography sx={{ fontWeight: 500 }}>
                        <Box 
                          component="span" 
                          mr={1.5} 
                          sx={{ 
                            fontSize: '1.2rem',
                            width: 28,
                            textAlign: 'center'
                          }}
                        >
                          {keyPoint.emoji}
                        </Box>
                        {keyPoint.title}
                      </Typography>
                    } 
                  />
                  {expandedItems[`keypoint-${index}`] ? 
                    <ExpandMoreIcon sx={{ transform: 'rotate(180deg)', transition: 'transform 0.3s' }} /> : 
                    <ExpandMoreIcon sx={{ transition: 'transform 0.3s' }} />
                  }
                </ListItemButton>
              </ListItem>
              <Collapse in={expandedItems[`keypoint-${index}`]} timeout="auto" unmountOnExit>
                <Box 
                  sx={{ 
                    px: 3, 
                    py: 2.5, 
                    bgcolor: 'action.hover',
                    borderTop: '1px dashed',
                    borderColor: 'divider',
                  }}
                  className="markdown-content"
                >
                  <ReactMarkdown>
                    {keyPoint.description}
                  </ReactMarkdown>

                  <Typography variant="subtitle2" sx={{ 
                    fontWeight: 600, 
                    mt: 3,
                    mb: 2
                  }}>
                    {keyPoint.chapterTitle}
                  </Typography>
                  
                  {keyPoint.protocols && keyPoint.protocols.length > 0 && (
                    <Box 
                      sx={{ 
                        mt: 3,
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: 600, 
                        display: 'flex', 
                        alignItems: 'center',
                        mb: 2
                      }}>
                        <LightbulbOutlined sx={{ mr: 1, fontSize: '1.2rem', color: 'warning.main' }} />
                        Protocols
                      </Typography>
                      <Stack spacing={1.5}>
                        {keyPoint.protocols.map((protocol, protocolIndex) => {
                          const protocolId = `keypoint-${index}-protocol-${protocolIndex}`;
                          return (
                            <Box key={protocolIndex}>
                              <Card 
                                variant="outlined"
                                sx={{ 
                                  borderRadius: 1.5,
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}
                              >
                                <CardContent sx={{ 
                                  py: 1.5, 
                                  px: 2, 
                                  '&:last-child': { pb: 1.5 },
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}>
                                  <Typography variant="body2">
                                    {protocol}
                                  </Typography>
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleProtocol(protocolId, protocol, keyPoint.chapterTitle);
                                    }}
                                    sx={{ ml: 1 }}
                                    aria-label="Expand protocol details"
                                  >
                                    <InfoOutlined fontSize="small" color="primary" />
                                  </IconButton>
                                </CardContent>
                              </Card>
                              <Collapse in={expandedProtocols[protocolId]} timeout="auto" unmountOnExit>
                                <Box 
                                  sx={{ 
                                    mt: 1, 
                                    mb: 2, 
                                    ml: 2, 
                                    p: 2, 
                                    borderLeft: '2px solid', 
                                    borderColor: 'primary.main',
                                    bgcolor: 'background.paper',
                                    borderRadius: '0 8px 8px 0'
                                  }}
                                >
                                  {loadingProtocols[protocolId] ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                      <CircularProgress size={24} />
                                    </Box>
                                  ) : protocolDetails[protocolId] ? (
                                    <Box>
                                      <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                                        {protocolDetails[protocolId]?.explanation}
                                      </Typography>
                                      
                                      {protocolDetails[protocolId]?.implementationDetails && 
                                       protocolDetails[protocolId]?.implementationDetails.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                            Implementation Details:
                                          </Typography>
                                          <List dense sx={{ pl: 2 }}>
                                            {protocolDetails[protocolId]?.implementationDetails.map((detail, idx) => (
                                              <ListItem 
                                                key={idx} 
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
                                      )}
                                      
                                      {protocolDetails[protocolId]?.examples && 
                                       protocolDetails[protocolId]?.examples.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                            Examples:
                                          </Typography>
                                          {protocolDetails[protocolId]?.examples.map((example, idx) => (
                                            <Typography key={idx} variant="body2" sx={{ mb: 1, pl: 2 }}>
                                              • {example}
                                            </Typography>
                                          ))}
                                        </Box>
                                      )}
                                      
                                      {protocolDetails[protocolId]?.additionalNotes && (
                                        <Box sx={{ mt: 2 }}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            Additional Notes:
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary">
                                            {protocolDetails[protocolId]?.additionalNotes}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      Failed to load protocol details. Please try again.
                                    </Typography>
                                  )}
                                </Box>
                              </Collapse>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </Box>
              </Collapse>
              {index < allKeyPoints.length - 1 && expandedItems[`keypoint-${index}`] && (
                <Divider sx={{ mt: -0.5 }} />
              )}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Box sx={{ 
          p: 4, 
          textAlign: 'center',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 2
        }}>
          <Typography color="text.secondary">
            No key points were found in this content.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default KeyPointsRenderer;
