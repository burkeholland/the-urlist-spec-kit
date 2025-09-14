import { query, withTransaction } from '../db';
import { ok, err, Result, List, ListError, UrlEntry } from './types';

// Helper to map DB row (snake_case) to List interface (keeping snake_case to align with DB for now)
function mapList(row: any): List {
  return row as List;
}

export async function createList(creatorSessionId: string): Promise<Result<List, ListError>> {
  const res = await query<List>(
    `INSERT INTO lists (creator_session_id, status) VALUES ($1,'draft') RETURNING *`,
    [creatorSessionId]
  );
  return ok(mapList(res.rows[0]));
}

export async function getList(id: string, opts?: { includeEntries?: boolean; forCreatorSession?: string }): Promise<Result<{ list: List; entries?: UrlEntry[] }, ListError>> {
  const listRes = await query<List>(`SELECT * FROM lists WHERE id=$1 AND deleted_at IS NULL`, [id]);
  if (listRes.rowCount === 0) return err('not_found');
  const list = mapList(listRes.rows[0]);
  if (opts?.forCreatorSession && list.creator_session_id !== opts.forCreatorSession) {
    // Do not leak existence
    return err('not_found');
  }
  let entries: UrlEntry[] | undefined;
  if (opts?.includeEntries) {
    const entRes = await query<UrlEntry>(`SELECT * FROM url_entries WHERE list_id=$1 ORDER BY position ASC`, [id]);
    entries = entRes.rows as UrlEntry[];
  }
  return ok({ list, entries });
}

export async function softDeleteList(id: string, creatorSessionId: string): Promise<Result<List, ListError>> {
  const res = await query<List>(
    `UPDATE lists SET deleted_at = now() WHERE id=$1 AND creator_session_id=$2 AND deleted_at IS NULL RETURNING *`,
    [id, creatorSessionId]
  );
  if (res.rowCount === 0) return err('not_found');
  return ok(mapList(res.rows[0]));
}

export async function assignSlug(id: string, slug: string, creatorSessionId: string): Promise<Result<List, ListError>> {
  // Slug validation minimal placeholder (improve later):
  if (!/^[a-z0-9-]{3,40}$/.test(slug)) return err('invalid_slug');
  try {
    const res = await query<List>(
      `UPDATE lists SET slug=$1 WHERE id=$2 AND creator_session_id=$3 AND deleted_at IS NULL AND status='draft' RETURNING *`,
      [slug, id, creatorSessionId]
    );
    if (res.rowCount === 0) return err('not_found');
    return ok(mapList(res.rows[0]));
  } catch (e: any) {
    if (e.message && e.message.includes('lists_slug_unique_published')) return err('slug_conflict');
    throw e;
  }
}

export async function publishList(id: string, creatorSessionId: string, ensureSlug: () => Promise<string>): Promise<Result<List, ListError>> {
  return withTransaction(async (trx) => {
    const listRes = await trx.query<List>(`SELECT * FROM lists WHERE id=$1 FOR UPDATE`, [id]);
    if (listRes.rowCount === 0) return err('not_found');
    const list = mapList(listRes.rows[0]);
    if (list.creator_session_id !== creatorSessionId) return err('not_found');
    if (list.deleted_at) return err('already_deleted');
    if (list.status === 'published') return err('already_published');
    const countRes = await trx.query<{ c: string }>(`SELECT COUNT(*)::int AS c FROM url_entries WHERE list_id=$1`, [id]);
    if ((countRes.rows[0] as any).c === 0) return err('empty_list_cannot_publish');

    let slug = list.slug;
    if (!slug) {
      slug = await ensureSlug();
    }
    try {
      const updated = await trx.query<List>(
        `UPDATE lists SET status='published', published_at=now(), slug=COALESCE(slug,$2) WHERE id=$1 RETURNING *`,
        [id, slug]
      );
      return ok(mapList(updated.rows[0]));
    } catch (e: any) {
      if (e.message?.includes('lists_slug_unique_published')) return err('slug_conflict');
      throw e;
    }
  });
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const res = await query(`SELECT 1 FROM lists WHERE lower(slug)=lower($1) AND status='published' AND deleted_at IS NULL LIMIT 1`, [slug]);
  return res.rowCount === 0;
}

export async function getPublicListBySlug(slug: string): Promise<{ list: List; entries: UrlEntry[] } | null> {
  const listRes = await query<List>(
    `SELECT * FROM lists WHERE lower(slug)=lower($1) AND status='published' AND deleted_at IS NULL`,
    [slug]
  );
  if (listRes.rowCount === 0) return null;
  const list = mapList(listRes.rows[0]);
  const entRes = await query<UrlEntry>(`SELECT * FROM url_entries WHERE list_id=$1 ORDER BY position ASC`, [list.id]);
  return { list, entries: entRes.rows as UrlEntry[] };
}
