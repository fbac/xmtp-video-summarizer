const FACTS_API_URL = 'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en';
const TIMEOUT_MS = 2000; // 2 second timeout to avoid blocking

interface FactsApiResponse {
  id: string;
  text: string;
  source: string;
  source_url: string;
  language: string;
  permalink: string;
}

/**
 * Fetch a random fact from the uselessfacts.jsph.pl API.
 * Returns undefined if the API is down or slow, ensuring non-blocking behavior.
 */
export async function getRandomFact(): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(FACTS_API_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return undefined;
    }

    const data = (await response.json()) as FactsApiResponse;
    return data.text;
  } catch {
    // Silently fail - don't block video processing if facts API is unavailable
    return undefined;
  }
}
