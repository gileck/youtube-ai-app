/**
 * Video Summary Action
 * Generates a summary of video content based on chapters and transcript
 */

import { AIModelAdapter } from '@/server/ai/baseModelAdapter';
import { CombinedTranscriptChapters } from '@/server/youtube/chaptersTranscriptService';
import { AIModelAdapterResponse } from '@/server/ai/types';
import { AiAction, AiActionChaptersOnly, aiActions, AiActionSingleChapter, ChaptersAiActionResult } from '@/services/AiActions/index';
import { YouTubeVideoDetails } from '@/shared/types/youtube';
import { VideoActionType } from '@/services/AiActions/index';
import _ from 'lodash';
import { ChapterWithContent } from '@/server/youtube';


export async function processAiAction<T>(
  {
    chaptersData,
    modelId,
    videoDetails,
    actionType,
    actionParams
  }: 
  {
    chaptersData: CombinedTranscriptChapters,
    modelId: string | undefined,
    videoDetails: YouTubeVideoDetails | null,
    actionType: VideoActionType,
    actionParams?: Record<string, unknown>
  }
): Promise<AIModelAdapterResponse<T> | AIModelAdapterResponse<ChaptersAiActionResult<T>>> {
  const { mainPrompt, singleChapter } = aiActions[actionType] as AiAction<T> | AiActionChaptersOnly<T> | AiActionSingleChapter<T>
  if (singleChapter) {
    return processAiActionSingleChapter<T>({
      chaptersData,
      modelId,
      videoDetails,
      actionType,
      actionParams: actionParams || {}
    })
  }
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
        chapters: [chapter],
        content: chapter.content,
        params: {}
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

  function combineChapters(chaptersData: CombinedTranscriptChapters, numberOfChapters: number) {
    const chapterChunks = _.chunk(chaptersData.chapters, numberOfChapters).map((chaptersArray: Array<ChapterWithContent>) => ({
      chapters: chaptersArray,
      content: `
      ${chaptersArray.map(chapter => `
        ----------- START OF CHAPTER ---------------
        Chapter Title: ${chapter.title}
        Chapter Content: ${chapter.content}
        ----------- END OF CHAPTER ----------------
        `).join('\n')}
      `
    })) as Array<{ chapters: Array<ChapterWithContent>, content: string }>;
    
    return {
      chapters: chapterChunks,
    }
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
    actionType,
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

  const combinedChapters = combineChapters(chaptersData, 15)

  const chapterPromises = combinedChapters.chapters.map(async (chaptersArray) => {

    const _chpaterPrompt = chapterPrompt({
      videoDetails: videoDetails,
      chapters: chaptersArray.chapters,
      content: chaptersArray.content,
      params: {}
    })
  
    try {
      const response = await modelAdapter.processPromptToJSON<T>(_chpaterPrompt, actionType);
      
      totalCost += response.cost.totalCost;
      
      return {
        title: chaptersArray.chapters.map(chapter => chapter.title).join(', '),
        result: response.result
      };
    } catch (error) {
      console.error(`Error summarizing chapter "${chaptersArray.chapters.map(chapter => chapter.title).join(', ')}":`, error);
      return {
        title: chaptersArray.chapters.map(chapter => chapter.title).join(', '),
        result: null
      };
    }
  });
  
  const chapterResults = await Promise.all(chapterPromises);
  
  return {
    result: {
      chapters: chapterResults
    },
    cost: {
      totalCost: totalCost
    }
  };
}

export async function processAiActionSingleChapter<T>(
  {
    chaptersData,
    modelId,
    videoDetails,
    actionType,
    actionParams
  }: 
  {
    chaptersData: CombinedTranscriptChapters,
    modelId: string | undefined,
    videoDetails: YouTubeVideoDetails | null,
    actionType: VideoActionType,
    actionParams: Record<string, unknown>
  }
): Promise<AIModelAdapterResponse<T>> {
  const { chapterPrompt } = aiActions[actionType] as AiActionSingleChapter<T>
  const modelAdapter = new AIModelAdapter(modelId);
  const chapter = chaptersData.chapters.find(chapter => chapter.title === actionParams.chapterTitle)
  if (!chapter) {
    throw new Error(`Chapter not found: ${actionParams.chapterTitle}`);
  }
  const prompt = chapterPrompt({
    videoDetails: videoDetails,
    chapters: [chapter],
    content: chapter.content,
    params: actionParams
  })

  const response = await modelAdapter.processPromptToJSON<T>(prompt, actionType);

  return {
    result: response.result,
    cost: {
      totalCost: response.cost.totalCost
    }
  };
}
  
