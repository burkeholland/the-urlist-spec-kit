// Centralized environment configuration & validation.
// Access via getConfig() to ensure single parse.

export interface AppConfig {
  DATABASE_URL: string;
  SESSION_COOKIE_NAME: string;
  METADATA_FETCH_TIMEOUT_MS: number;
}

let cached: AppConfig | null = null;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

export function getConfig(): AppConfig {
  if (cached) return cached;
  const DATABASE_URL = requireEnv('DATABASE_URL');
  const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'urlist_session';
  const timeoutRaw = process.env.METADATA_FETCH_TIMEOUT_MS || '5000';
  const METADATA_FETCH_TIMEOUT_MS = Number(timeoutRaw);
  if (!Number.isFinite(METADATA_FETCH_TIMEOUT_MS) || METADATA_FETCH_TIMEOUT_MS <= 0) {
    throw new Error('METADATA_FETCH_TIMEOUT_MS must be a positive integer');
  }
  cached = {
    DATABASE_URL,
    SESSION_COOKIE_NAME,
    METADATA_FETCH_TIMEOUT_MS,
  };
  return cached;
}
