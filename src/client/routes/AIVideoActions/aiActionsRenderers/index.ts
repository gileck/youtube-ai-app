/**
 * Export all AI action renderers
 */

import { VideoActionType } from '../../../../server/ai/video-actions';
import { SummaryRenderer } from './SummaryRenderer';
import { ComponentType } from 'react';

// Interface for renderer props
export interface ActionRendererProps {
  result: string;
}

// Map of action types to their corresponding renderer components
export const actionRenderers: Record<VideoActionType, ComponentType<ActionRendererProps>> = {
  'summary': SummaryRenderer,
  // Add more renderers here as they are implemented
  'highlights': SummaryRenderer, // Placeholder - replace with actual implementation
  'questions': SummaryRenderer, // Placeholder - replace with actual implementation
};

// Export individual renderers for direct imports
export { SummaryRenderer };