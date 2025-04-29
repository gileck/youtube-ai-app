import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Button,
  Collapse,
  CircularProgress,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ReactMarkdown from 'react-markdown';
import { ActionRendererProps, ChaptersAiActionResult, CustomActionType, CustomResponseType } from '../types';
import { CustomResult } from '.';
import { processAIVideoAction } from '@/apis/aiVideoActions/client';
import { SuggestedQueries } from './SuggestedQueries';

// Define the detailed list item type
interface DetailedItem {
  title: string;
  description: string;
  emoji: string;
  chapterTitle?: string; // Optional chapter title
}

interface ExpandableItem extends DetailedItem {
  id: string;
  expanded?: boolean;
  expandedItems?: DetailedItem[];
  loading?: boolean;
}

export const CustomRenderer: React.FC<ActionRendererProps<CustomResult | ChaptersAiActionResult<CustomResult>>> = ({ result, videoId, playerApi }) => {
  // State to track expanded items (for nested content)
  const [expandedItems, setExpandedItems] = useState<Record<string, {
    expanded: boolean;
    items?: DetailedItem[];
    loading: boolean;
  }>>({});

  // State to track which descriptions are visible
  const [visibleDescriptions, setVisibleDescriptions] = useState<Record<string, boolean>>({});

  // Toggle description visibility
  const toggleDescription = (itemId: string) => {
    setVisibleDescriptions(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Generate unique ID for items
  const generateItemId = (item: DetailedItem, index: number): string => {
    return `${item.title.substring(0, 10)}-${index}`;
  };

  // Handle expand button click
  const handleExpand = async (item: ExpandableItem) => {
    const itemId = item.id;
    
    if (expandedItems[itemId]?.expanded) {
      // Collapse the item
      setExpandedItems(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], expanded: false }
      }));
      return;
    }

    // Set loading state
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: { expanded: true, loading: true, items: prev[itemId]?.items }
    }));

    try {
      // Make sure we have a chapter title
      if (!item.chapterTitle) {
        throw new Error("Cannot expand item without chapter information");
      }
      
      // Call the custom AI action with the item's details to get expanded content
      const response = await processAIVideoAction({
        videoId,
        actionType: 'custom',
        actionParams: {
          query: `Tell me more about: ${item.title}. Explain the details and practical applications of this concept.`,
          responseType: 'list' as CustomResponseType,
          actionType: 'singleChapter' as CustomActionType, // Use singleChapter mode
          chapterTitle: item.chapterTitle // Required for singleChapter mode
        }
      }, {
        bypassCache: true
      });

      // Extract result items
      let nestedItems: DetailedItem[] = [];
      if (response.data?.result) {
        const responseData = response.data.result as any; // Cast to any for type safety in handling
        
        // Handle direct array of detailed items
        if (Array.isArray(responseData) && responseData.length > 0 && 
            typeof responseData[0] === 'object' && responseData[0] !== null && 'title' in responseData[0]) {
          nestedItems = responseData as DetailedItem[];
        } 
        // Handle chapter structure
        else if (
          responseData && 
          typeof responseData === 'object' && 
          'chapters' in responseData && 
          Array.isArray(responseData.chapters) && 
          responseData.chapters.length > 0
        ) {
          // Extract from chapters structure if present
          nestedItems = responseData.chapters
            .filter((chapter: any) => chapter && chapter.result)
            .flatMap((chapter: any) => {
              if (Array.isArray(chapter.result) && chapter.result.length > 0 && 
                  typeof chapter.result[0] === 'object' && chapter.result[0] !== null && 'title' in chapter.result[0]) {
                return chapter.result.map((item: any) => ({
                  ...item,
                  chapterTitle: chapter.title
                }));
              }
              return [];
            });
        }
      }

      // Update state with the expanded items
      setExpandedItems(prev => ({
        ...prev,
        [itemId]: { expanded: true, loading: false, items: nestedItems }
      }));
    } catch (error) {
      console.error('Error expanding item:', error);
      // Update state to show error
      setExpandedItems(prev => ({
        ...prev,
        [itemId]: { expanded: true, loading: false, items: [] }
      }));
    }
  };

  // Handle play button click
  const handlePlay = (item: ExpandableItem) => {
    if (!playerApi || !item.chapterTitle) return;
    
    // Find the chapter in the video and seek to it
    const chapterTimestamp = findChapterTimestamp(item.chapterTitle);
    if (chapterTimestamp !== undefined) {
      playerApi.seekTo(chapterTimestamp);
      playerApi.play();
    }
  };

  // Helper to find chapter timestamp (this is a placeholder - you'll need to implement this)
  const findChapterTimestamp = (chapterTitle: string): number | undefined => {
    // This is a placeholder. In a real implementation, you would:
    // 1. Look up the chapter by title in your chapters data
    // 2. Return the timestamp in seconds
    // Since we don't have access to that data here, we'll just return undefined
    return undefined;
  };

  // Render detailed list (with emoji, title, description)
  const renderDetailedList = (items: DetailedItem[], level = 0) => {
    const itemsWithIds: ExpandableItem[] = items.map((item, index) => ({
      ...item,
      id: generateItemId(item, index)
    }));

    return (
      <Box sx={{ 
        borderTop: level === 0 ? '1px solid rgba(0, 0, 0, 0.12)' : 'none', 
        borderBottom: level === 0 ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
        py: 1
      }}>
        <List sx={{ p: 0 }}>
          {itemsWithIds.map((item, index) => {
            const isExpanded = expandedItems[item.id]?.expanded || false;
            const isLoading = expandedItems[item.id]?.loading || false;
            const expandedItemsList = expandedItems[item.id]?.items || [];
            const isDescriptionVisible = visibleDescriptions[item.id] || false;
            
            return (
              <React.Fragment key={item.id}>
                <ListItem 
                  sx={{ 
                    py: 1.5, 
                    borderBottom: index < items.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ fontSize: '1.5rem', minWidth: 40, mt: 0.5 }}>
                      {item.emoji}
                    </ListItemIcon>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {item.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {item.chapterTitle && (
                            <Button 
                              startIcon={<PlayArrowIcon />} 
                              onClick={() => handlePlay(item)}
                              disabled={!playerApi || !item.chapterTitle}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              Play
                            </Button>
                          )}
                          
                          <IconButton 
                            size="small" 
                            onClick={() => toggleDescription(item.id)}
                            aria-label={isDescriptionVisible ? "Hide description" : "Show description"}
                          >
                            {isDescriptionVisible ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Collapse in={isDescriptionVisible}>
                        <Box sx={{ mt: 1 }}>
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
                                  sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }} 
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
                            {item.description}
                          </ReactMarkdown>

                          {item.chapterTitle && (
                            <Typography 
                              component="div" 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ mt: 0.5, fontStyle: 'italic' }}
                            >
                              From: {item.chapterTitle}
                            </Typography>
                          )}
                        </Box>
                        
                        {/* Expand button moved inside description */}
                        <Box sx={{ mt: 2, mb: 1 }}>
                          <Button 
                            startIcon={isLoading ? <CircularProgress size={16} /> : <ExpandMoreIcon />}
                            onClick={() => handleExpand(item)}
                            disabled={isLoading}
                            color={isExpanded ? "primary" : "inherit"}
                            size="small"
                            variant="outlined"
                          >
                            {isExpanded ? "Collapse" : "Expand for more details"}
                          </Button>
                        </Box>
                      </Collapse>
                    </Box>
                  </Box>
                  
                  {/* Nested items - keeping this outside the description box */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ width: '100%', pl: 4, mt: 1 }}>
                    {isLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : expandedItemsList.length > 0 ? (
                      <Box sx={{ borderLeft: '2px solid rgba(0, 0, 0, 0.08)', pl: 2 }}>
                        {renderNestedList(expandedItemsList, level + 1)}
                      </Box>
                    ) : isExpanded ? (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No additional details available.
                      </Typography>
                    ) : null}
                  </Collapse>
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      </Box>
    );
  };

  // Helper function to render nested lists - solves recursive call stack issue
  const renderNestedList = (items: DetailedItem[], level = 0) => {
    const itemsWithIds: ExpandableItem[] = items.map((item, index) => ({
      ...item,
      id: generateItemId(item, index)
    }));

    return (
      <Box sx={{ 
        py: 1
      }}>
        <List sx={{ p: 0 }}>
          {itemsWithIds.map((item, index) => {
            const isExpanded = expandedItems[item.id]?.expanded || false;
            const isLoading = expandedItems[item.id]?.loading || false;
            const expandedItemsList = expandedItems[item.id]?.items || [];
            const isDescriptionVisible = visibleDescriptions[item.id] || false;
            
            return (
              <React.Fragment key={item.id}>
                <ListItem 
                  sx={{ 
                    py: 1.5, 
                    borderBottom: index < items.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ fontSize: '1.5rem', minWidth: 40, mt: 0.5 }}>
                      {item.emoji}
                    </ListItemIcon>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {item.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {item.chapterTitle && (
                            <Button 
                              startIcon={<PlayArrowIcon />} 
                              onClick={() => handlePlay(item)}
                              disabled={!playerApi || !item.chapterTitle}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              Play
                            </Button>
                          )}
                          
                          <IconButton 
                            size="small" 
                            onClick={() => toggleDescription(item.id)}
                            aria-label={isDescriptionVisible ? "Hide description" : "Show description"}
                          >
                            {isDescriptionVisible ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Collapse in={isDescriptionVisible}>
                        <Box sx={{ mt: 1 }}>
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
                                  sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }} 
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
                            {item.description}
                          </ReactMarkdown>

                          {item.chapterTitle && (
                            <Typography 
                              component="div" 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ mt: 0.5, fontStyle: 'italic' }}
                            >
                              From: {item.chapterTitle}
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </Box>
                  </Box>
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      </Box>
    );
  };

  // Render simple string list
  const renderStringList = (items: string[]) => (
    <Box sx={{ 
      borderTop: '1px solid rgba(0, 0, 0, 0.12)', 
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      py: 1
    }}>
      <List sx={{ p: 0 }}>
        {items.map((item, index) => (
          <ListItem 
            key={index}
            sx={{ 
              py: 1, 
              borderBottom: index < items.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none'
            }}
          >
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // Render text content
  const renderText = (content: string) => (
    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
      {content}
    </Typography>
  );

  // Helper to check if an array is a detailed item array
  const isDetailedItemArray = (arr: any[]): arr is DetailedItem[] => {
    return arr.length > 0 && 
      typeof arr[0] === 'object' && 
      arr[0] !== null &&
      'title' in arr[0] && 
      'description' in arr[0] && 
      'emoji' in arr[0];
  };

  // Helper to process content of any type
  const processContent = (content: any) => {
    if (content === null || content === undefined) {
      return null;
    }

    if (typeof content === 'string') {
      return renderText(content);
    }

    if (Array.isArray(content)) {
      // If it looks like a detailed item array
      if (isDetailedItemArray(content)) {
        // Add chapter title to items if provided
          const itemsWithChapter = content.map(item => ({
            ...item,
            chapterTitle: item.chapterTitle 
          }));
          return renderDetailedList(itemsWithChapter);
      }
      
      // Otherwise treat as string array
      return renderStringList(content.map((item: any) => String(item)));
    }

    // Fallback
    return renderText(JSON.stringify(content));
  };

  // Handle direct array or string result (combined mode)
  if (Array.isArray(result) || typeof result === 'string') {
    return (
      <>
        <SuggestedQueries 
          onSelectQuery={(queryParams) => {
            if (videoId) {
              processAIVideoAction({
                videoId,
                actionType: 'custom',
                actionParams: queryParams
              });
            }
          }}
        />
        {processContent(result)}
      </>
    );
  }

  // Handle chapter result structure
  if (result && 'chapters' in result && Array.isArray(result.chapters)) {
    // Create a flattened array of all items from all chapters
    const allItems: DetailedItem[] = [];
    
    // Process each chapter
    for (const chapter of result.chapters) {
      if (!chapter.result) continue;
      
       
      else if (Array.isArray(chapter.result)) {
        // Array result - could be DetailedItems or strings
        if (chapter.result.length === 0) continue;
        
        // Try to process as detailed items
        try {
          if (chapter.result.every(item => 
            typeof item === 'object' && 
            item !== null && 
            'title' in item && 
            'description' in item && 
            'emoji' in item
          )) {
            // It's a valid DetailedItem array, add each item
            for (const item of chapter.result) {
              const detailedItem = item as unknown as DetailedItem;
              allItems.push({
                title: detailedItem.title,
                description: detailedItem.description,
                emoji: detailedItem.emoji,
                chapterTitle: detailedItem.chapterTitle
              });
            }
          } else {
            // It's a string array or other type, convert each item
            for (const item of chapter.result) {
              allItems.push({
                title: `Item from ${chapter.title}`,
                description: String(item),
                emoji: '📝',
                chapterTitle: chapter.title
              });
            }
          }
        } catch (error) {
          // Fallback in case of errors processing the array
          allItems.push({
            title: chapter.title,
            description: 'Error processing this chapter',
            emoji: '⚠️',
            chapterTitle: chapter.title
          });
        }
      }
    }
    
    // Render the combined list
    if (allItems.length > 0) {
      return (
        <>
          <SuggestedQueries 
            onSelectQuery={(queryParams) => {
              if (videoId) {
                processAIVideoAction({
                  videoId,
                  actionType: 'custom',
                  actionParams: queryParams
                });
              }
            }}
          />
          {renderDetailedList(allItems)}
        </>
      );
    } else {
      return (
        <>
          <SuggestedQueries 
            onSelectQuery={(queryParams) => {
              if (videoId) {
                processAIVideoAction({
                  videoId,
                  actionType: 'custom',
                  actionParams: queryParams
                });
              }
            }}
          />
          <Typography>No items found in chapters</Typography>
        </>
      );
    }
  }

  // Handle object result with 'result' property
  if (result && typeof result === 'object' && 'result' in result) {
    return (
      <>
        <SuggestedQueries 
          onSelectQuery={(queryParams) => {
            if (videoId) {
              processAIVideoAction({
                videoId,
                actionType: 'custom',
                actionParams: queryParams
              });
            }
          }}
        />
        {processContent(result.result)}
      </>
    );
  }

  // Fallback for any other type
  return (
    <>
      <SuggestedQueries 
        onSelectQuery={(queryParams) => {
          if (videoId) {
            processAIVideoAction({
              videoId,
              actionType: 'custom',
              actionParams: queryParams
            });
          }
        }}
      />
      {processContent(result)}
    </>
  );
}; 