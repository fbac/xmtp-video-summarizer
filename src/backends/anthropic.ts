import Anthropic from '@anthropic-ai/sdk';
import {DEFAULT_ANTHROPIC_MODEL, SUMMARIZATION_PROMPT} from '../youtube/constants.js';
import type {AIBackendType, SummarizationError, SummarizationResult, SummarizerBackend} from './types.js';

/**
 * Anthropic summarization backend using Claude models.
 * Implements SummarizerBackend directly since Anthropic's API
 * is not OpenAI-compatible.
 */
export class AnthropicSummarizer implements SummarizerBackend {
  readonly name: AIBackendType = 'anthropic';
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({apiKey});
    this.model = model;
  }

  /**
   * Create an Anthropic summarizer from environment variables.
   * @throws Error if ANTHROPIC_API_KEY is not set.
   */
  static create(): AnthropicSummarizer {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required for Anthropic backend.');
    }

    const model = process.env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL;

    return new AnthropicSummarizer(apiKey, model);
  }

  async summarize(transcript: string, videoId: string): Promise<SummarizationResult | SummarizationError> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1500,
        system: SUMMARIZATION_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Please summarize the following YouTube video transcript (Video ID: ${videoId}):\n\n${transcript}`,
          },
        ],
      });

      // Extract text from content blocks
      const summary = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('');

      if (!summary) {
        return {
          success: false,
          error: 'Anthropic returned an empty response.',
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

  private handleError(error: unknown): SummarizationError {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check for rate limiting
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return {
        success: false,
        error: 'Rate limited by Anthropic. Please try again later.',
        code: 'RATE_LIMITED',
      };
    }

    // Check for API errors
    if (errorMessage.includes('API') || errorMessage.includes('401') || errorMessage.includes('403')) {
      return {
        success: false,
        error: `Anthropic API error: ${errorMessage}`,
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
