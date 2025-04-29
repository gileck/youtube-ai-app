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
  // Common processing parameters
  const processingParams = {
    chaptersData,
    modelId,
    videoDetails,
    actionType,
    actionParams: actionParams || {}
  };
  
  // Get the appropriate action configuration - either from custom action or standard action
  let actionConfig: any;
  
  if (actionType === 'custom' && 'getActionForParams' in aiActions[actionType]) {
    // For custom action type, get the configuration based on params
    const customActionData = aiActions[actionType] as unknown as import('@/services/AiActions/CustomAction').CustomAiAction;
    actionConfig = customActionData.getActionForParams(actionParams);
  } else {
    // For standard action types, use the configuration directly
    actionConfig = aiActions[actionType];
  }
  
  // Single unified flow based on action configuration
  if (actionConfig.singleChapter) {
    return processAiActionSingleChapter(processingParams) as unknown as AIModelAdapterResponse<T>;
  } else if (actionConfig.mainPrompt) {
    return processAiActionChaptersAndMain(processingParams) as unknown as AIModelAdapterResponse<T>;
  } else {
    return processAiActionChaptersOnly(processingParams) as unknown as AIModelAdapterResponse<ChaptersAiActionResult<T>>;
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
      params: actionParams || {}
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
    params: actionParams || {},
    videoDetails: videoDetails,
    chapters: chapterResults.map(chapter => ({
      title: chapter.title,
      result: chapter.result || '',
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

function combineChapters(chaptersData: CombinedTranscriptChapters, numberOfChaptersToCombine: number) {
  const chapterChunks = _.chunk(chaptersData.chapters, numberOfChaptersToCombine).map((chaptersArray: Array<ChapterWithContent>) => ({
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
    actionParams
  }:
    {
      chaptersData: CombinedTranscriptChapters,
      modelId: string | undefined,
      videoDetails: YouTubeVideoDetails | null,
      actionType: VideoActionType,
      actionParams?: Record<string, unknown>
    }
): Promise<AIModelAdapterResponse<ChaptersAiActionResult<T>>> {
  const { chapterPrompt } = aiActions[actionType] as AiActionChaptersOnly<T>
  const modelAdapter = new AIModelAdapter(modelId);

  let totalCost = 0;

  function calculateNumberOfChaptersChunks(numberOfChapters: number) {
    return Math.min(Math.ceil(numberOfChapters / 15), 5);
  }

  const combinedChapters = combineChapters(chaptersData,
    calculateNumberOfChaptersChunks(chaptersData.chapters.length)
  )

  const chapterPromises = combinedChapters.chapters.map(async (chaptersArray) => {
    const _chpaterPrompt = chapterPrompt({
      videoDetails: videoDetails,
      chapters: chaptersArray.chapters,
      content: chaptersArray.content,
      params: actionParams || {}
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

  // console.log('chapters', {
  //   chapters: chaptersData.chapters.map(chapter => chapter.title.toLowerCase()),
  //   chapterTitleLower: (actionParams.chapterTitle as string).toLowerCase()
  // });

  const chapter = chaptersData.chapters.find(chapter => {
    if (!chapter.title || !actionParams.chapterTitle) {
      return false;
    }
    const lowerTitle = chapter.title.toLowerCase().trim();
    const lowerChapterTitle = (actionParams.chapterTitle as string).toLowerCase().trim();
    return lowerTitle === lowerChapterTitle || lowerTitle.includes(lowerChapterTitle) || lowerChapterTitle.includes(lowerTitle)
  })
  if (!chapter) {
    throw new Error(`Chapter not found: ${actionParams.chapterTitle}`);
  }
  const prompt = chapterPrompt({
    videoDetails: videoDetails,
    chapters: [chapter],
    content: chapter.content,
    params: actionParams,
    chapterSegmants: chapter.segments
  })

  const response = await modelAdapter.processPromptToJSON<T>(prompt, actionType);

  return {
    result: response.result,
    cost: {
      totalCost: response.cost.totalCost
    }
  };
}

