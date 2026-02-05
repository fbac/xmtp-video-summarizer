import {getSummarizerBackend} from '../backends/index.js';

// Re-export types for backward compatibility
export type {SummarizationResult, SummarizationError} from '../backends/types.js';

/**
 * Summarizes a video transcript using the configured AI backend.
 */
export async function summarizeTranscript(transcript: string, videoId: string) {
  const backend = getSummarizerBackend();
  return backend.summarize(transcript, videoId);
}
