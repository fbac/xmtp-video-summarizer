import OpenAI from 'openai';
import {SUMMARIZATION_PROMPT} from '../youtube/constants.js';
import type {
  AIBackendType,
  BackendConfig,
  SummarizationError,
  SummarizationResult,
  SummarizerBackend,
} from './types.js';

/**
 * Abstract base class for OpenAI-compatible API backends.
 * Perplexity and other providers use the same API format.
 */
export abstract class OpenAICompatibleBackend implements SummarizerBackend {
  abstract readonly name: AIBackendType;
  protected readonly client: OpenAI;
  protected readonly model: string;

  constructor(config: BackendConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
    this.model = config.model;
  }

  async summarize(transcript: string, videoId: string): Promise<SummarizationResult | SummarizationError> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: SUMMARIZATION_PROMPT,
          },
          {
            role: 'user',
            content: `Please summarize the following YouTube video transcript (Video ID: ${videoId}):\n\n${transcript}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const summary = response.choices[0]?.message?.content;

      if (!summary) {
        return {
          success: false,
          error: `${this.name} returned an empty response.`,
          code: 'API_ERROR',
        };
      }

      return {
        success: true,
        summary,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected handleError(error: unknown): SummarizationError {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for rate limiting
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return {
        success: false,
        error: `Rate limited by ${this.name}. Please try again later.`,
        code: 'RATE_LIMITED',
      };
    }

    // Check for API errors
    if (errorMessage.includes('API') || errorMessage.includes('401') || errorMessage.includes('403')) {
      return {
        success: false,
        error: `${this.name} API error: ${errorMessage}`,
        code: 'API_ERROR',
      };
    }

    return {
      success: false,
      error: `Failed to summarize transcript: ${errorMessage}`,
      code: 'UNKNOWN',
    };
  }
}
