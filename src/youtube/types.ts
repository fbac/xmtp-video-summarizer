export interface CacheEntry {
  summary: string;
  createdAt: number;
}

export interface SummaryResult {
  videoId: string;
  summary: string;
  cached: boolean;
}

export interface SummaryError {
  videoId: string;
  error: string;
  code: 'NO_TRANSCRIPT' | 'PRIVATE_VIDEO' | 'RATE_LIMITED' | 'UNKNOWN';
}

export interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
}
