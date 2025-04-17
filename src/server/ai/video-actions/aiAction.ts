/**
 * Video Summary Action
 * Generates a summary of video content based on chapters and transcript
 */

import { AIModelAdapter } from '../baseModelAdapter';
import { CombinedTranscriptChapters } from '../../youtube/chaptersTranscriptService';
import { AIModelAdapterResponse } from '../types';
import { AiAction, AiActionChaptersOnly, aiActions, ChaptersAiActionResult } from '@/services/AiActions/index';
import { YouTubeVideoDetails } from '@/shared/types/youtube';
import { VideoActionType } from '@/services/AiActions/index';


export async function processAiAction<T>(
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
): Promise<AIModelAdapterResponse<T> | AIModelAdapterResponse<ChaptersAiActionResult<T>>> {
  const { mainPrompt } = aiActions[actionType] as AiAction<T> | AiActionChaptersOnly<T>
  if (mainPrompt) {
    return processAiActionChaptersAndMain({
      chaptersData,
      modelId,
      videoDetails,
      actionType
    }) as Promise<AIModelAdapterResponse<T>>
  } else {
    return processAiActionChaptersOnly({
      chaptersData,
      modelId,
      videoDetails,
      actionType
    }) as Promise<AIModelAdapterResponse<ChaptersAiActionResult<T>>>
  }

  

}

//
/**
 * Generate a summary for each chapter and then summarize those summaries
 * @param chaptersData The combined chapters and transcript data
 * @param modelId Optional model ID to use for summarization
 * @param videoTitle Optional video title to include in the summary
 * @returns Promise with the summary result and accumulated cost
 */
export async function processAiActionChaptersAndMain<T>(
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
    const { chapterPrompt, mainPrompt } = aiActions[actionType] as AiAction<T>
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

/**
 * Generate a summary for each chapter and then summarize those summaries
 * @param chaptersData The combined chapters and transcript data
 * @param modelId Optional model ID to use for summarization
 * @param videoTitle Optional video title to include in the summary
 * @returns Promise with the summary result and accumulated cost
 */
export async function processAiActionChaptersOnly<T>(
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
): Promise<AIModelAdapterResponse<ChaptersAiActionResult<T>>> {
  const { chapterPrompt } = aiActions[actionType] as AiActionChaptersOnly<T>
  const modelAdapter = new AIModelAdapter(modelId);

  let totalCost = 0;

  const chapterPromises = chaptersData.chapters.map(async (chapter) => {

    const _chpaterPrompt = chapterPrompt({
      videoDetails: videoDetails,
      chapter: chapter
    })
  
    try {
      const response = await modelAdapter.processPromptToJSON<T>(_chpaterPrompt, actionType);
      
      totalCost += response.cost.totalCost;
      
      return {
        title: chapter.title,
        result: response.result
      };
    } catch (error) {
      console.error(`Error summarizing chapter "${chapter.title}":`, error);
      return {
        title: chapter.title,
        result: null
      };
    }
  });
  
  const chapterResults = await Promise.all(chapterPromises);
  
  return {
    result: chapterResults,
    cost: {
      totalCost: totalCost
    }
  };
}

