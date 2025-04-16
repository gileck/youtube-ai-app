/**
 * Video Summary Action
 * Generates a summary of video content based on chapters and transcript
 */

import { AIModelAdapter } from '../baseModelAdapter';
import { CombinedTranscriptChapters } from '../../youtube/chaptersTranscriptService';
import { AIModelAdapterResponse } from '../types';
import { aiActions } from '@/services/AiActions/index';
import { YouTubeVideoDetails } from '@/shared/types/youtube';
import { VideoActionType } from '@/services/AiActions/index';

/**
 * Generate a summary for each chapter and then summarize those summaries
 * @param chaptersData The combined chapters and transcript data
 * @param modelId Optional model ID to use for summarization
 * @param videoTitle Optional video title to include in the summary
 * @returns Promise with the summary result and accumulated cost
 */
async function processAiAction<T>(
    {

      chaptersData,
      modelId,
      videoDetails,
      actionType
    }: 
    {
      chaptersData: CombinedTranscriptChapters,
      modelId: string | undefined,
      videoDetails: YouTubeVideoDetails | null,
      actionType: VideoActionType
    }
  ): Promise<AIModelAdapterResponse<T>> {
    const { chapterPrompt, mainPrompt } = aiActions[actionType]
    const modelAdapter = new AIModelAdapter(modelId);

    let totalCost = 0;

    if (chaptersData.chapters.length === 0) {
      //defulat to full transcript
      // const transcript = chaptersData.transcript.map(segment => segment.text).join(' ');

      
    }
    
    const chapterPromises = chaptersData.chapters.map(async (chapter) => {

      const _chpaterPrompt = chapterPrompt({
        videoDetails: videoDetails,
        chapter: chapter
      })
    
      try {
        const response = await modelAdapter.processPromptToText(_chpaterPrompt, actionType);
        
        totalCost += response.cost.totalCost;
        
        return {
          title: chapter.title,
          result: response.result
        };
      } catch (error) {
        console.error(`Error summarizing chapter "${chapter.title}":`, error);
        return {
          title: chapter.title,
          result: ''
        };
      }
    });
    
    const chapterResults = await Promise.all(chapterPromises);
    
    const finalPrompt = mainPrompt({
      videoDetails: videoDetails,
      chapters: chapterResults.map(chapter => ({
        title: chapter.title,
        result: chapter.result || ''
      }))
    });

    const finalResult = await modelAdapter.processPromptToJSON<T>(
      finalPrompt,
      actionType
    );

    totalCost += finalResult.cost.totalCost;

    return {
      result: finalResult.result,
      usage: finalResult.usage,
      cost: {
        totalCost: totalCost
      }
    };
  }

// Export the action
export { processAiAction };
