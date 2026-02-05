import {YOUTUBE_URL_REGEX, VIDEO_ID_REGEX} from './constants.js';

export interface ExtractedLink {
  url: string;
  videoId: string;
}

/**
 * Extracts all YouTube links from a text message.
 * Returns an array of objects containing the full URL and video ID.
 */
export function extractYouTubeLinks(text: string): ExtractedLink[] {
  const links: ExtractedLink[] = [];
  const seen = new Set<string>();

  // Reset regex state
  YOUTUBE_URL_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = YOUTUBE_URL_REGEX.exec(text)) !== null) {
    const url = match[0];
    const videoId = match[1];

    // Skip if no video ID captured or duplicate
    if (!videoId || seen.has(videoId)) {
      continue;
    }

    if (isValidVideoId(videoId)) {
      seen.add(videoId);
      links.push({url, videoId});
    }
  }

  return links;
}

/**
 * Validates a YouTube video ID format.
 * Valid IDs are exactly 11 characters containing only alphanumeric, underscore, and hyphen.
 */
export function isValidVideoId(videoId: string): boolean {
  return VIDEO_ID_REGEX.test(videoId);
}
