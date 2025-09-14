import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { getConfig } from './config';

const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface Session {
  id: string; // uuid
}

export async function getSession(): Promise<Session | null> {
  const cfg = getConfig();
  const store = await cookies();
  const c = store.get(cfg.SESSION_COOKIE_NAME);
  if (!c) return null;
  return { id: c.value };
}

export async function ensureSession(): Promise<Session> {
  const cfg = getConfig();
  const existing = await getSession();
  if (existing) return existing;
  const s: Session = { id: randomUUID() };
  const store = await cookies();
  store.set(cfg.SESSION_COOKIE_NAME, s.id, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });
  return s;
}
