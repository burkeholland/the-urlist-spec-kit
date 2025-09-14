// Domain entity & result types (T015)

export interface List {
  id: string;
  creator_session_id: string;
  slug: string | null;
  status: 'draft' | 'published';
  created_at: string; // ISO strings when serialized
  updated_at: string;
  published_at: string | null;
  deleted_at: string | null;
}

export interface UrlEntry {
  id: string;
  list_id: string;
  original_url: string;
  normalized_url: string;
  title: string | null;
  description: string | null;
  fetch_status: 'pending' | 'success' | 'failed';
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ActionsLogRow {
  id: number;
  list_id: string;
  event: 'publish' | 'delete';
  slug: string | null;
  created_at: string;
}

// Result helpers
export type Ok<T> = { ok: true; value: T };
export type Err<E extends string = string> = { ok: false; error: E; details?: any };
export type Result<T, E extends string = string> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> { return { ok: true, value }; }
export function err<E extends string>(error: E, details?: any): Err<E> { return { ok: false, error, details }; }

// Specific error codes (extend as needed)
export type ListError =
  | 'not_found'
  | 'already_published'
  | 'already_deleted'
  | 'empty_list_cannot_publish'
  | 'slug_conflict'
  | 'invalid_slug'
  | 'immutable_after_publish';

export type EntryError =
  | 'not_found'
  | 'list_not_found'
  | 'immutable_after_publish';
