import { processAIVideoAction } from '@/apis/aiVideoActions/client';
import { DetailedItem, ExpandableItem, ExpandedItemsState } from '../types';
import { CustomActionType, CustomResponseType } from '../../types';

/**
 * Handle expanding an item to fetch additional details
 */
export const expandItem = async (
  item: ExpandableItem,
  videoId: string,
  expandedItems: ExpandedItemsState,
  setExpandedItems: (state: ExpandedItemsState) => void
): Promise<void> => {
  const itemId = item.id;
  
  // If already expanded, collapse it
  if (expandedItems[itemId]?.expanded) {
    setExpandedItems({
      ...expandedItems,
      [itemId]: { ...expandedItems[itemId], expanded: false }
    });
    return;
  }

  // Set loading state
  setExpandedItems({
    ...expandedItems,
    [itemId]: { 
      expanded: true, 
      loading: true, 
      items: expandedItems[itemId]?.items 
    }
  });

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
        query: `Tell me more about: ${item.answer}. Explain the details and practical applications of this concept.`,
        responseType: 'list' as CustomResponseType,
        actionType: 'singleChapter' as CustomActionType,
        chapterTitle: item.chapterTitle
      }
    }, {
      bypassCache: true
    });

    // Extract result items
    let nestedItems: DetailedItem[] = [];
    if (response.data?.result) {
      const responseData = response.data.result as any;
      
      // Handle direct array of detailed items
      if (Array.isArray(responseData) && responseData.length > 0 && 
          typeof responseData[0] === 'object' && responseData[0] !== null && 'answer' in responseData[0]) {
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
                typeof chapter.result[0] === 'object' && chapter.result[0] !== null && 'answer' in chapter.result[0]) {
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
    setExpandedItems({
      ...expandedItems,
      [itemId]: { expanded: true, loading: false, items: nestedItems }
    });
  } catch (error) {
    console.error('Error expanding item:', error);
    // Update state to show error
    setExpandedItems({
      ...expandedItems,
      [itemId]: { expanded: true, loading: false, items: [] }
    });
  }
}; 