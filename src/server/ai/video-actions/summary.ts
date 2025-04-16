// /**
//  * Video Summary Action
//  * Generates a summary of video content based on chapters and transcript
//  */

// import { AIModelAdapter } from '../baseModelAdapter';
// import { CombinedTranscriptChapters } from '../../youtube/chaptersTranscriptService';
// import { VideoActionHandler } from './types';
// import { AIModelAdapterResponse } from '../types';

// // Default model to use if none specified


// /**
//  * Generate a summary for each chapter and then summarize those summaries
//  * @param chaptersData The combined chapters and transcript data
//  * @param modelId Optional model ID to use for summarization
//  * @param videoTitle Optional video title to include in the summary
//  * @returns Promise with the summary result and accumulated cost
//  */
// const summaryAction: VideoActionHandler = {
//   process: async (
//     chaptersData: CombinedTranscriptChapters,
//     modelId: string | undefined,
//     videoTitle: string = 'Unknown Video Title',
//   ): Promise<AIModelAdapterResponse<string>> => {
//     // Initialize the AI model adapter
//     const modelAdapter = new AIModelAdapter(modelId);
    
//     // Track total cost across all AI calls
//     let totalCost = 0;
    
//     // If there are no chapters, return an error
//     if (!chaptersData.chapters || chaptersData.chapters.length === 0) {
//       throw new Error('No chapters found in the video');
//     }
    
//     // Step 1: Generate summaries for each chapter
//     const chapterSummaryPromises = chaptersData.chapters.map(async (chapter) => {
//       // Skip chapters with no content
//       if (!chapter.content || chapter.content.trim() === '') {
//         return {
//           title: chapter.title,
//           summary: 'No content available for this chapter.'
//         };
//       }
      
//       const prompt = `
//         Summarize the following video chapter content in 2-3 concise sentences:
        
//         Chapter Title: "${chapter.title}"
        
//         Content:
//         ${chapter.content.slice(0, 4000)} // Limit content to prevent token overflow
//       `;
      
//       try {
//         const response = await modelAdapter.processPromptToText(prompt, 'video-summary-chapter');
        
//         // Accumulate the cost
//         totalCost += response.cost.totalCost;
        
//         return {
//           title: chapter.title,
//           summary: response.result
//         };
//       } catch (error) {
//         console.error(`Error summarizing chapter "${chapter.title}":`, error);
//         return {
//           title: chapter.title,
//           summary: `Error generating summary for this chapter: ${error instanceof Error ? error.message : 'Unknown error'}`
//         };
//       }
//     });
    
//     // Wait for all chapter summaries to complete
//     const chapterSummaries = await Promise.all(chapterSummaryPromises);
    
//     // Step 2: Generate an overall summary from the chapter summaries
//     const overallSummaryPrompt = `
//       Create a comprehensive summary of this video based on the following chapter summaries:

//       Video Title: ${videoTitle}
      
//       Chapter Summaries:
//       ${chapterSummaries.map(summary => `
//         - ${summary.title}: ${summary.summary}
//       `).join('\n')}
      
//       Provide a concise but informative summary that captures the main points and key takeaways from the video.
//       Format your response in markdown with clear sections and bullet points where appropriate.
//     `;
    
//     // Generate the overall summary
//     const overallSummary = await modelAdapter.processPromptToText(
//       overallSummaryPrompt,
//       'video-summary-overall'
//     );
    
//     // Add the cost of the overall summary to the total cost
//     totalCost += overallSummary.cost.totalCost;
    
//     // Return the overall summary with the accumulated total cost
//     return {
//       result: overallSummary.result,
//       usage: overallSummary.usage,
//       cost: {
//         totalCost: totalCost
//       }
//     };
//   }
// };

// // Export the summary action
// export { summaryAction };
