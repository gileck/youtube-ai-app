/**
 * YouTube transcript service using youtubei.js
 * This service provides functions to fetch transcripts from YouTube videos
 * without requiring an API key, using the youtubei.js library.
 */

import { Innertube } from 'youtubei.js';
import type { YTNodes } from 'youtubei.js';

// Define our response interface
export interface TranscriptResponse {
    segments: Array<{
      start_seconds: number;
      end_seconds: number;
      text: string;
      start_time_text: string;
    }>;
}

/**
 * Format seconds to a readable time format (MM:SS)
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format with leading zeros
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
};

/**
 * Fetch transcript for a YouTube video using youtubei.js
 * @param videoId - YouTube video ID
 * @returns Promise with transcript data or error
 */
export const fetchTranscript = async (videoId: string): Promise<TranscriptResponse> => {
    // Temporarily silence console.error to suppress YouTube.js parser errors
    const originalConsoleWarning = console.warn;
    console.warn = (...args: unknown[]) => {
      const errorMessage = args.map(arg => String(arg)).join(' ');
      if (errorMessage.includes('[YOUTUBEJS][Parser]') &&
        errorMessage.includes('CompositeVideoPrimaryInfo not found')) {
        // Suppress this specific error
        return;
      }
      // Pass through all other errors
      originalConsoleWarning(...args);
    };

    // Initialize the Innertube client
    const youtube = await Innertube.create({
      lang: 'en',
      location: 'US',
      retrieve_player: false,
    });

    // Get the video info
    const info = await youtube.getInfo(videoId);

    // Get the transcript
    const transcriptInfo = await info.getTranscript();

    // Restore original console.error
    console.warn = originalConsoleWarning;

    // Extract transcript segments
    const content = transcriptInfo.transcript?.content;
    const body = content?.body;


    // Get segments from the transcript data
    const segments = body?.initial_segments || [];

    // Process the segments
    const processedSegments = [];

    // Process each segment safely
    for (const segment of segments) {
      // Skip segments without required properties
      if (!segment || typeof segment !== 'object') continue;

      // Skip segments that are not transcript segments (like section headers)
      if (segment.type !== 'TranscriptSegment') continue;

      // Type assertion to access properties safely
      const typedSegment = segment as YTNodes.TranscriptSegment;

      // Safe access to properties with fallbacks
      const startMs = typeof typedSegment.start_ms === 'string'
        ? parseInt(typedSegment.start_ms, 10)
        : (typeof typedSegment.start_ms === 'number' ? typedSegment.start_ms : 0);

      const endMs = typeof typedSegment.end_ms === 'string'
        ? parseInt(typedSegment.end_ms, 10)
        : (typeof typedSegment.end_ms === 'number' ? typedSegment.end_ms : 0);

      // Convert milliseconds to seconds
      const startSeconds = startMs / 1000;
      const endSeconds = endMs / 1000;

      // Safe access to snippet text
      let text = '';
      if (typedSegment.snippet && typeof typedSegment.snippet === 'object' && typedSegment.snippet.text) {
        text = String(typedSegment.snippet.text);
      }

      // Safe access to start_time_text
      let startTimeText = '';
      if (typedSegment.start_time_text &&
        typeof typedSegment.start_time_text === 'object' &&
        typedSegment.start_time_text.text) {
        startTimeText = String(typedSegment.start_time_text.text);
      } else {
        startTimeText = formatTime(startSeconds);
      }

      // Add to processed segments
      processedSegments.push({
        start_seconds: startSeconds,
        end_seconds: endSeconds,
        text,
        start_time_text: startTimeText
      });
    }

    return {
      segments: processedSegments
    };
}


export const youtubeTranscriptService = {
  fetchTranscript
};

