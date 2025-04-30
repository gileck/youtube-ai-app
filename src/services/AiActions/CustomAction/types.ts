// Type definitions for Custom Renderer components

// Basic item structure
export interface DetailedItem {
  answer: string;
  description: string;
  emoji: string;
  chapterTitle?: string;
}

// Item with expansion state
export interface ExpandableItem extends DetailedItem {
  id: string;
  expanded?: boolean;
  expandedItems?: DetailedItem[];
  loading?: boolean;
}

// State of expanded items
export interface ExpandedItemState {
  expanded: boolean;
  items?: DetailedItem[];
  loading: boolean;
}

// State for tracking expanded items
export type ExpandedItemsState = Record<string, ExpandedItemState>;

// State for tracking visible descriptions
export type VisibleDescriptionsState = Record<string, boolean>; 