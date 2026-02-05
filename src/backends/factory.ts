import {AnthropicSummarizer} from './anthropic.js';
import {OpenAISummarizer} from './openai.js';
import {PerplexitySummarizer} from './perplexity.js';
import type {AIBackendType, SummarizerBackend} from './types.js';

let cachedBackend: SummarizerBackend | null = null;

/**
 * Detect which backend to use based on environment variables.
 * Priority:
 * 1. Explicit AI_BACKEND setting
 * 2. Auto-detect from available API keys (prefers OpenAI if both are set)
 */
export function detectBackend(): AIBackendType {
  const explicitBackend = process.env.AI_BACKEND?.toLowerCase();

  if (explicitBackend === 'perplexity') {
    return 'perplexity';
  }

  if (explicitBackend === 'openai') {
    return 'openai';
  }

  if (explicitBackend === 'anthropic') {
    return 'anthropic';
  }

  // Auto-detect from available API keys
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasPerplexity = !!process.env.PERPLEXITY_API_KEY;

  if (hasOpenAI) {
    return 'openai';
  }

  if (hasAnthropic) {
    return 'anthropic';
  }

  if (hasPerplexity) {
    return 'perplexity';
  }

  // Default to OpenAI (will fail at runtime if no key is set)
  return 'openai';
}

/**
 * Create a summarizer backend instance for the given type.
 */
function createBackend(type: AIBackendType): SummarizerBackend {
  switch (type) {
    case 'openai':
      return OpenAISummarizer.create();
    case 'anthropic':
      return AnthropicSummarizer.create();
    case 'perplexity':
      return PerplexitySummarizer.create();
    default:
      throw new Error(`Unknown AI backend type: ${type}`);
  }
}

/**
 * Get the singleton summarizer backend.
 * Creates the backend on first call based on environment configuration.
 */
export function getSummarizerBackend(): SummarizerBackend {
  if (!cachedBackend) {
    const backendType = detectBackend();
    cachedBackend = createBackend(backendType);
  }
  return cachedBackend;
}

/**
 * Reset the cached backend instance.
 * Useful for testing or when environment variables change.
 */
export function resetBackend(): void {
  cachedBackend = null;
}
