/**
 * Supported AI backend types for summarization.
 */
export type AIBackendType = 'openai' | 'perplexity' | 'anthropic';

/**
 * Configuration for an AI backend.
 */
export interface BackendConfig {
  apiKey: string;
  model: string;
  baseURL?: string;
}

/**
 * Result of a successful summarization.
 */
export interface SummarizationResult {
  success: true;
  summary: string;
}

/**
 * Result of a failed summarization.
 */
export interface SummarizationError {
  success: false;
  error: string;
  code: 'RATE_LIMITED' | 'API_ERROR' | 'UNKNOWN';
}

/**
 * Interface for AI summarization backends.
 */
export interface SummarizerBackend {
  /**
   * The name of this backend (e.g., 'openai', 'perplexity').
   */
  readonly name: AIBackendType;

  /**
   * Summarize a video transcript.
   */
  summarize(
    transcript: string,
    videoId: string
  ): Promise<SummarizationResult | SummarizationError>;
}
