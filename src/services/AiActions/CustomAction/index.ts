import { Search } from "@mui/icons-material";
import { AiAction, AiActionChaptersOnly, AiActionSingleChapter, CustomAiActionParams } from "../types";
import { CustomRenderer } from "./CustomRenderer";
import { chapterPrompt } from "./chaptersPrompt";
import { mainPrompt } from "./mainPrompt";

// Custom type for the result based on response type
export type CustomResult = string | string[];

// Union type that can be either AiAction, AiActionChaptersOnly, or AiActionSingleChapter depending on actionType
export type CustomAiAction = (AiAction<CustomResult> | AiActionChaptersOnly<CustomResult> | AiActionSingleChapter<CustomResult>) & {
    // Add a method to determine which action to use based on actionParams
    getActionForParams: (params?: Record<string, unknown>) => AiAction<CustomResult> | AiActionChaptersOnly<CustomResult> | AiActionSingleChapter<CustomResult>;
};

export const customAction: CustomAiAction = {
    isMainAction: true,
    icon: Search,
    label: 'Custom',
    renderer: CustomRenderer,
    // These will be overridden by getActionForParams
    mainPrompt,
    chapterPrompt,
    singleChapter: false,
    
    // Method to select the appropriate action type based on parameters
    getActionForParams: (params?: Record<string, unknown>) => {
        const actionParams = params as CustomAiActionParams | undefined;
        
        // Default to 'combined' if no actionType is specified
        const actionType = actionParams?.actionType || 'combined';
        
        if (actionType === 'chapters') {
            // Return a chapters-only action
            return {
                isMainAction: true,
                icon: Search,
                label: 'Custom',
                renderer: CustomRenderer,
                chapterPrompt,
                mainPrompt: false,
                singleChapter: false
            };
        } else if (actionType === 'singleChapter') {
            // Single chapter mode (used when expanding specific items)
            if (!actionParams?.chapterTitle) {
                console.warn('singleChapter mode requires chapterTitle parameter');
            }
            
            return {
                isMainAction: false,
                icon: Search,
                label: 'Custom',
                renderer: CustomRenderer,
                chapterPrompt,
                mainPrompt: false,
                singleChapter: true
            };
        } else {
            // Return a combined action (default)
            return {
                isMainAction: true,
                icon: Search,
                label: 'Custom',
                renderer: CustomRenderer,
                mainPrompt,
                chapterPrompt,
                singleChapter: false
            };
        }
    }
}; 