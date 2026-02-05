import {DEFAULT_PERPLEXITY_MODEL} from '../youtube/constants.js';
import {OpenAICompatibleBackend} from './base.js';
import type {AIBackendType} from './types.js';

const PERPLEXITY_BASE_URL = 'https://api.perplexity.ai';

/**
 * Perplexity summarization backend.
 * Uses OpenAI-compatible API with a different base URL.
 */
export class PerplexitySummarizer extends OpenAICompatibleBackend {
  readonly name: AIBackendType = 'perplexity';

  /**
   * Create a Perplexity summarizer from environment variables.
   * @throws Error if PERPLEXITY_API_KEY is not set.
   */
  static create(): PerplexitySummarizer {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is required for Perplexity backend.');
    }

    const model = process.env.PERPLEXITY_MODEL || DEFAULT_PERPLEXITY_MODEL;

    return new PerplexitySummarizer({
      apiKey,
      model,
      baseURL: PERPLEXITY_BASE_URL,
    });
  }
}
