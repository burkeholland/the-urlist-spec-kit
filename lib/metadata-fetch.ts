// Placeholder metadata fetcher (T008)
// TODO (T043): Implement real HTML fetching + parsing (title, description, og tags) and error handling.

import { getConfig } from './config';

export interface FetchedMetadata {
  url: string;
  status: 'pending' | 'success' | 'failed' | 'timeout';
  title?: string;
  description?: string;
  error?: string;
}

export async function fetchMetadata(url: string): Promise<FetchedMetadata> {
  const { METADATA_FETCH_TIMEOUT_MS } = getConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), METADATA_FETCH_TIMEOUT_MS);
  try {
    // Placeholder: skip actual network call for now.
    // Future: const res = await fetch(url, { signal: controller.signal, headers: { 'user-agent': 'urlist-metadata-bot/1.0' }});
    // Parse HTML for title/description.
    return { url, status: 'pending' }; // will be replaced with success/failed logic.
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { url, status: 'timeout', error: 'Timeout exceeded' };
    }
    return { url, status: 'failed', error: err.message };
  } finally {
    clearTimeout(timeout);
  }
}
