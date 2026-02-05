import {DEFAULT_OPENAI_MODEL} from '../youtube/constants.js';
import {OpenAICompatibleBackend} from './base.js';
import type {AIBackendType} from './types.js';

/**
 * OpenAI summarization backend.
 */
export class OpenAISummarizer extends OpenAICompatibleBackend {
  readonly name: AIBackendType = 'openai';

  /**
   * Create an OpenAI summarizer from environment variables.
   * @throws Error if OPENAI_API_KEY is not set.
   */
  static create(): OpenAISummarizer {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required for OpenAI backend.');
    }

    const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;

    return new OpenAISummarizer({apiKey, model});
  }
}
