import {summaryCache} from './cache.js';
import {fetchTranscript} from './transcript.js';
import {summarizeTranscript} from './summarizer.js';
import {extractYouTubeLinks} from './validator.js';
import {getRandomFact} from './facts.js';

export type ProcessVideoResult = {success: true; summary: string; cached: boolean} | {success: false; error: string};

/**
 * Process a YouTube video: check cache, fetch transcript, summarize, and cache result.
 */
async function processVideo(videoId: string): Promise<ProcessVideoResult> {
  // Check cache first
  const cachedSummary = summaryCache.get(videoId);
  if (cachedSummary) {
    return {success: true, summary: cachedSummary, cached: true};
  }

  // Fetch transcript
  const transcriptResult = await fetchTranscript(videoId);
  if (!transcriptResult.success) {
    return {success: false, error: transcriptResult.error};
  }

  // Summarize transcript
  const summaryResult = await summarizeTranscript(transcriptResult.transcript, videoId);
  if (!summaryResult.success) {
    return {success: false, error: summaryResult.error};
  }

  // Cache the result
  summaryCache.set(videoId, summaryResult.summary);

  return {success: true, summary: summaryResult.summary, cached: false};
}

interface Conversation {
  sendMarkdown(content: string): Promise<unknown>;
}

export interface SummarizeOptions {
  maxLinks?: number;
}

export interface SummarizeResult {
  found: number;
  processed: number;
}

/**
 * Extract YouTube links from text, process them, and send summaries.
 * Single source of truth for YouTube summarization logic.
 */
export async function summarize(
  text: string,
  conversation: Conversation,
  options?: SummarizeOptions
): Promise<SummarizeResult> {
  const links = extractYouTubeLinks(text);

  if (links.length === 0) {
    return {found: 0, processed: 0};
  }

  const linksToProcess = options?.maxLinks ? links.slice(0, options.maxLinks) : links;

  for (const {videoId, url} of linksToProcess) {
    const isCached = summaryCache.has(videoId);

    if (!isCached) {
      // Fetch random fact in parallel with sending message (non-blocking)
      const fact = await getRandomFact();
      const factLine = fact ? `\n\n💡 **Did you know?** ${fact}` : '';
      await conversation.sendMarkdown(`Processing video... 🤓${factLine}`);
    }

    const result = await processVideo(videoId);

    if (!result.success) {
      await conversation.sendMarkdown(`**Error:** ${result.error}\n\n*Video: ${url}*`);
      continue;
    }

    const cachedLabel = result.cached ? ' (cached)' : '';
    await conversation.sendMarkdown(`**Video Summary**${cachedLabel}\n\n${result.summary}\n\n---\n*Video: ${url}*`);
  }

  return {found: links.length, processed: linksToProcess.length};
}
