  import { fetchTranscript, TranscriptResponse } from '../youtube/transcript/youtubeTranscriptService';
import { Chapter, fetchChapters } from '../youtube/chapters/chaptersService';
import { ChapterWithContent, TranscriptSegment } from '../youtube/types';

/**
 * Configuration for filtering out chapters and transcript items based on their content
 */
const chapterFilterConfig = {
  /**
   * List of words/phrases that will cause a chapter to be filtered out
   * Case-insensitive matching is applied
   */
  filteredPhrases: [
    'sponsor',
    'advertisement',
    'ad break',
    'promotion',
  ],

  /**
   * List of words/phrases that will cause a transcript item to be filtered out
   * Case-insensitive matching is applied
   */
  filteredTranscriptPhrases: [
    'is sponsored by',
    'this video is sponsored by',
    'today\'s sponsor',
    'special thanks to our sponsor',
  ]
};

export interface CombinedTranscriptChapters {
  videoId: string;
  metadata: {
    totalDuration: number;
    chapterCount: number;
    transcriptItemCount: number;
    overlapOffsetSeconds: number;
  };
  chapters: ChapterWithContent[];
  transcript: TranscriptResponse['segments'];
  error?: string;
}

/**
 * Split transcript into artificial chapters when no chapters are available from the video
 * 
 * @param transcript Array of transcript items
 * @param videoId YouTube video ID
 * @param options Processing options including overlap offset
 * @returns Combined transcript and chapters data
 */
export function splitTranscriptToChapters(
  transcript: TranscriptResponse['segments'], 
  videoId: string, 
  options: { 
    overlapOffsetSeconds: number;
    segmentsPerChapter?: number;
    totalChapters?: number;
  } = { 
    overlapOffsetSeconds: 5,
    segmentsPerChapter: 30,
    totalChapters: 0, // 0 means auto-calculate based on segmentsPerChapter
  }
): CombinedTranscriptChapters {
  if (!transcript || transcript.length === 0) {
    return {
      videoId,
      metadata: {
        totalDuration: 0,
        chapterCount: 0,
        transcriptItemCount: 0,
        overlapOffsetSeconds: options.overlapOffsetSeconds
      },
      chapters: [],
      transcript: [],
      error: 'No transcript available to split into chapters'
    };
  }

  // Sort transcript by start time to ensure chronological order
  const sortedTranscript = [...transcript].sort((a, b) => a.start_seconds - b.start_seconds);
  
  // Determine the total duration from the last transcript item
  const lastItem = sortedTranscript[sortedTranscript.length - 1];
  const totalDuration = lastItem.end_seconds;
  
  // Determine number of chapters based on options
  const segmentsPerChapter = options.segmentsPerChapter || 30;
  let totalChapters = options.totalChapters || 0;
  
  if (totalChapters <= 0) {
    // Auto-calculate number of chapters based on segmentsPerChapter
    totalChapters = Math.ceil(sortedTranscript.length / segmentsPerChapter);
    // Ensure we have at least 3 chapters and at most 10 for reasonable navigation
    totalChapters = Math.max(3, Math.min(10, totalChapters));
  }
  
  // Calculate segments per chapter based on total transcript length and desired chapter count
  const actualSegmentsPerChapter = Math.ceil(sortedTranscript.length / totalChapters);
  
  // Create artificial chapters
  const artificialChapters: Chapter[] = [];
  
  for (let i = 0; i < totalChapters; i++) {
    const startIndex = i * actualSegmentsPerChapter;
    const endIndex = Math.min((i + 1) * actualSegmentsPerChapter - 1, sortedTranscript.length - 1);
    
    // Use the start and end timestamps from the transcript segments
    const startTime = sortedTranscript[startIndex].start_seconds;
    const endTime = i === totalChapters - 1 
      ? totalDuration 
      : sortedTranscript[endIndex].end_seconds;
    
    // Generate a title based on the chapter number and timestamp
    const startMinutes = Math.floor(startTime / 60);
    const startSeconds = Math.floor(startTime % 60);
    const formattedTime = `${startMinutes}:${startSeconds.toString().padStart(2, '0')}`;
    
    artificialChapters.push({
      title: `Chapter ${i + 1} (${formattedTime})`,
      startTime,
      endTime
    });
  }
  
  // Apply overlap to chapters
  const chaptersWithOverlap = applyChapterOverlap(artificialChapters, options.overlapOffsetSeconds);
  
  // Initialize chapters with content containers
  const chaptersWithContent = initializeChaptersWithContent(chaptersWithOverlap);
  
  // Assign transcript segments to chapters
  for (const segment of sortedTranscript) {
    // Skip filtered transcript items
    if (shouldFilterTranscriptItem(segment.text)) {
      continue;
    }
    
    // Find all chapters that contain this segment's timestamp
    for (const chapter of chaptersWithContent) {
      if (segment.start_seconds >= chapter.startTime && segment.start_seconds <= chapter.endTime) {
        // Calculate relative position within the chapter (0-1)
        const relativePosition = calculateRelativePosition(segment.start_seconds, chapter);
        
        // Convert YouTube transcript segment to TranscriptSegment format
        const transcriptSegment: TranscriptSegment = {
          text: segment.text,
          offset: segment.start_seconds,
          duration: segment.end_seconds - segment.start_seconds,
          relativeOffset: relativePosition
        };
        
        // Add segment to this chapter
        chapter.segments.push(transcriptSegment);
        
        // Add to content (will be rebuilt in finalizeOutput)
        if (!chapter.content) {
          chapter.content = segment.text;
        } else {
          chapter.content += ' ' + segment.text;
        }
      }
    }
  }
  
  // Finalize the output using the existing finalizeOutput function
  return finalizeOutput(chaptersWithContent, transcript, videoId, {
    overlapOffsetSeconds: options.overlapOffsetSeconds
  });
}

/**
 * Apply overlap offset to chapter timestamps
 * This extends both start and end times to create overlap between chapters
 * 
 * @param chapters Original chapters
 * @param overlapOffsetSeconds Seconds to extend each chapter by
 * @returns Chapters with adjusted timestamps
 */
function applyChapterOverlap(
  chapters: Chapter[],
  overlapOffsetSeconds: number
): Chapter[] {
  return chapters.map((chapter, index) => {
    // For first chapter, don't decrease start time
    const adjustedStartTime = index === 0
      ? chapter.startTime
      : Math.max(0, chapter.startTime - overlapOffsetSeconds);

    // Extend end time for all chapters
    const adjustedEndTime = chapter.endTime + overlapOffsetSeconds;

    return {
      ...chapter,
      startTime: adjustedStartTime,
      endTime: adjustedEndTime
    };
  });
}

/**
 * Initialize chapters with empty content containers
 * 
 * @param chapters Chapters
 * @returns Chapters with content containers
 */
function initializeChaptersWithContent(chapters: Chapter[]): ChapterWithContent[] {
  return chapters.map(chapter => ({
    title: chapter.title,
    startTime: chapter.startTime,
    endTime: chapter.endTime,
    content: '',
    segments: []
  }));
}

/**
 * Calculate relative position of a timestamp within a chapter (0-1)
 * 
 * @param timestamp Timestamp in seconds
 * @param chapter Chapter object
 * @returns Relative position (0-1)
 */
function calculateRelativePosition(timestamp: number, chapter: ChapterWithContent): number {
  const chapterDuration = chapter.endTime === Number.MAX_SAFE_INTEGER
    ? 300 // Assume 5 minutes for last chapter
    : chapter.endTime - chapter.startTime;

  const relativePosition = (timestamp - chapter.startTime) / chapterDuration;
  return Math.max(0, Math.min(1, relativePosition)); // Clamp between 0-1
}

/**
 * Check if a chapter should be filtered out based on its title
 * 
 * @param chapterTitle The title of the chapter to check
 * @returns True if the chapter should be filtered out, false otherwise
 */
function shouldFilterChapter(chapterTitle: string): boolean {
  const normalizedTitle = chapterTitle.toLowerCase();
  
  return chapterFilterConfig.filteredPhrases.some(phrase => 
    normalizedTitle.includes(phrase.toLowerCase())
  );
}

/**
 * Check if a transcript item should be filtered out based on its text content
 * 
 * @param transcriptText The text content of the transcript item
 * @returns True if the transcript item should be filtered out, false otherwise
 */
function shouldFilterTranscriptItem(transcriptText: string): boolean {
  const normalizedText = transcriptText.toLowerCase();
  
  return chapterFilterConfig.filteredTranscriptPhrases.some(phrase => 
    normalizedText.includes(phrase.toLowerCase())
  );
}

/**
 * Finalize the combined output
 * 
 * @param chaptersWithContent Chapters with content
 * @param transcript Original transcript
 * @param videoId Video ID
 * @param options Processing options
 * @returns Finalized combined data
 */
function finalizeOutput(
  chaptersWithContent: ChapterWithContent[],
  transcript: TranscriptResponse['segments'],
  videoId: string,
  options: { 
    overlapOffsetSeconds: number;
  }
): CombinedTranscriptChapters {
  // Calculate total duration from last chapter
  const lastChapter = chaptersWithContent[chaptersWithContent.length - 1];
  const totalDuration = lastChapter.endTime === Number.MAX_SAFE_INTEGER
    ? lastChapter.startTime + 300 // Add 5 minutes as estimate
    : lastChapter.endTime;

  // Sort segments in each chapter by offset and rebuild content
  const processedChapters = chaptersWithContent.map(chapter => {
    // Sort segments by offset
    const sortedSegments = [...chapter.segments].sort((a, b) => a.offset - b.offset);

    // Rebuild content from sorted segments
    const content = sortedSegments.map(segment => segment.text).join(' ');

    return {
      title: chapter.title,
      startTime: chapter.startTime,
      endTime: chapter.endTime,
      content: content.trim(),
      segments: sortedSegments
    };
  });

  return {
    videoId,
    metadata: {
      totalDuration,
      chapterCount: chaptersWithContent.length,
      transcriptItemCount: transcript.length,
      overlapOffsetSeconds: options.overlapOffsetSeconds
    },
    chapters: processedChapters,
    transcript
  };
}

/**
 * Combine transcript items with chapters
 * Pure function that maps transcript items to their respective chapters
 * 
 * @param transcript Array of transcript items
 * @param chapters Array of chapters
 * @param videoId Video ID
 * @param options Optional configuration parameters
 * @returns Combined transcript and chapters data
 */
function combineTranscriptAndChapters(
  transcript: TranscriptResponse['segments'],
  chapters: Chapter[],
  videoId: string,
  options: {
    overlapOffsetSeconds: number;
  } = { overlapOffsetSeconds: 5 }
): CombinedTranscriptChapters {
  // If no transcript or chapters, return empty structure
  if (!transcript.length || !chapters.length) {
    return {
      transcript: [],
      videoId,
      metadata: {
        totalDuration: 0,
        chapterCount: 0,
        transcriptItemCount: 0,
        overlapOffsetSeconds: options.overlapOffsetSeconds
      },
      chapters: []
    };
  }

  // 1. Apply overlap offset to chapter timestamps
  const overlappedChapters = applyChapterOverlap(chapters, options.overlapOffsetSeconds);

  // 2. Initialize chapter content containers
  const chaptersWithContent = initializeChaptersWithContent(overlappedChapters);

  // 3. Map each transcript item to all matching chapters
  transcript.forEach((item) => {
    const segmentTimeSeconds = item.start_seconds;

    // Find all chapters that contain this timestamp
    for (let i = 0; i < overlappedChapters.length; i++) {
      const chapter = overlappedChapters[i];

      // Check if this segment belongs in this chapter
      if (segmentTimeSeconds >= chapter.startTime && segmentTimeSeconds < chapter.endTime) {
        const chapterContent = chaptersWithContent[i];
        const relativePosition = calculateRelativePosition(segmentTimeSeconds, chapterContent);

        // Add text to chapter content
        chapterContent.content += ' ' + item.text;

        // Add segment to chapter's segments array
        chapterContent.segments.push({
          text: item.text,
          offset: item.start_seconds,
          duration: item.end_seconds - item.start_seconds,
          relativeOffset: relativePosition
        });
      }
    }
  });

  // 4. Post-processing
  return finalizeOutput(chaptersWithContent, transcript, videoId, options);
}

/**
 * Get combined transcript and chapters for a YouTube video
 * 
 * @param videoId YouTube video ID
 * @param options Optional configuration parameters
 * @returns Promise with combined transcript and chapters data
 */
export async function getChaptersTranscripts(
  videoId: string,
  options: {
    overlapOffsetSeconds: number;
    segmentsPerChapter?: number;
    totalChapters?: number;
  } = { 
    overlapOffsetSeconds: 5,
    segmentsPerChapter: 30,
    totalChapters: 0
  }
): Promise<CombinedTranscriptChapters> {
  try {
    // Fetch transcript and chapters in parallel
    const [transcript, chapters] = await Promise.all([
      fetchTranscript(videoId),
      fetchChapters(videoId)
    ]);

    if (chapters.length === 0) {
      // Use the splitTranscriptToChapters as a fallback when no chapters are available
      return splitTranscriptToChapters(transcript.segments, videoId, options);
    }

    // Filter out transcript items based on their content if filtering is enabled
    const filteredTranscript = transcript.segments.filter(item => !shouldFilterTranscriptItem(item.text))

    // Filter out chapters based on their titles if filtering is enabled
    const filteredChapters = chapters.filter(chapter => !shouldFilterChapter(chapter.title));

    // Create fallback chapter if no chapters are available after filtering
    const effectiveChapters = filteredChapters.length > 0
      ? filteredChapters
      : [{ title: 'Full Video', startTime: 0, endTime: Number.MAX_SAFE_INTEGER }];

    // Combine transcript and chapters
    return combineTranscriptAndChapters(filteredTranscript, effectiveChapters, videoId, options);
  } catch (error) {
    // Return empty structure on error
    console.error(`Error getting chapters and transcript for video ${videoId}:`, error);
    return {
      videoId,
      metadata: {
        totalDuration: 0,
        chapterCount: 0,
        transcriptItemCount: 0,
        overlapOffsetSeconds: options.overlapOffsetSeconds
      },
      transcript: [],
      chapters: [],
      error: error instanceof Error ? error.message : String(error)
    } as CombinedTranscriptChapters & { error: string };
  }
}
