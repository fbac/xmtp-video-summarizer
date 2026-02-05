import {YoutubeTranscript} from 'youtube-transcript-plus';
import {type TranscriptSegment} from './types.js';
import {MAX_TRANSCRIPT_LENGTH} from './constants.js';

export interface TranscriptResult {
  success: true;
  transcript: string;
}

export interface TranscriptError {
  success: false;
  error: string;
  code: 'NO_TRANSCRIPT' | 'PRIVATE_VIDEO' | 'UNKNOWN';
}

/**
 * Fetches the transcript for a YouTube video.
 * Returns the full transcript text or an error.
 */
export async function fetchTranscript(videoId: string): Promise<TranscriptResult | TranscriptError> {
  try {
    const segments: TranscriptSegment[] = await YoutubeTranscript.fetchTranscript(videoId);

    if (!segments || segments.length === 0) {
      return {
        success: false,
        error: 'Transcript is disabled or unavailable for this video.',
        code: 'NO_TRANSCRIPT',
      };
    }

    // Combine all segments into a single transcript text
    let transcript = segments.map(segment => segment.text).join(' ');

    // Truncate if too long to avoid token limits
    if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
      transcript = transcript.slice(0, MAX_TRANSCRIPT_LENGTH) + '... [truncated]';
    }

    return {
      success: true,
      transcript,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for common error patterns
    if (
      errorMessage.includes('disabled') ||
      errorMessage.includes('not available') ||
      errorMessage.includes('Could not get the transcript')
    ) {
      return {
        success: false,
        error: 'Transcript is disabled or unavailable for this video.',
        code: 'NO_TRANSCRIPT',
      };
    }

    if (
      errorMessage.includes('private') ||
      errorMessage.includes('unavailable') ||
      errorMessage.includes('Video unavailable')
    ) {
      return {
        success: false,
        error: 'Video is unavailable or private.',
        code: 'PRIVATE_VIDEO',
      };
    }

    return {
      success: false,
      error: `Failed to fetch transcript: ${errorMessage}`,
      code: 'UNKNOWN',
    };
  }
}
