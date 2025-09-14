// Jest setup file - executed after environment is set up.
// Add custom matchers, global helpers, etc.

// Simple in-memory cookie jar to mock next/headers cookies() for route handlers.
type CookieRecord = { value: string; options?: any };
const cookieJar: Record<string, CookieRecord> = {};

jest.mock('next/headers', () => ({
	cookies: async () => ({
		get: (name: string) => (cookieJar[name] ? { name, value: cookieJar[name].value } : undefined),
		set: (name: string, value: string, options?: any) => { cookieJar[name] = { value, options }; },
		getAll: () => Object.entries(cookieJar).map(([name, v]) => ({ name, value: v.value })),
	}),
}));

// Helper to clear cookie jar between tests
beforeEach(() => {
	for (const k of Object.keys(cookieJar)) delete cookieJar[k];
});

// Optional per-test DB truncation placeholder (activated manually in specific test files when needed)
// We conditionally truncate if a test sets globalThis.__TRUNCATE_DB = true
import { truncateAll } from './test-db';

afterEach(async () => {
	// @ts-ignore
	if ((globalThis as any).__TRUNCATE_DB) {
		await truncateAll();
	}
});

export function __getTestCookies() { return cookieJar; }

export {};
