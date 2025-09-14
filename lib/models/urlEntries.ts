import { query, withTransaction } from '../db';
import { ok, err, Result, UrlEntry, EntryError } from './types';

function mapEntry(row: any): UrlEntry { return row as UrlEntry; }

export async function addEntry(listId: string, originalUrl: string, normalizedUrl: string): Promise<Result<{ entry: UrlEntry; duplicate: boolean }, EntryError>> {
  return withTransaction(async (trx) => {
    // Determine next position
    const posRes = await trx.query<{ max: number | null }>(`SELECT MAX(position) AS max FROM url_entries WHERE list_id=$1`, [listId]);
    const nextPos = (posRes.rows[0].max ?? 0) + 1;
    // Duplicate detection
    const dupRes = await trx.query<{ c: number }>(`SELECT COUNT(*)::int AS c FROM url_entries WHERE list_id=$1 AND normalized_url=$2`, [listId, normalizedUrl]);
    const duplicate = (dupRes.rows[0] as any).c > 0;
    try {
      const ins = await trx.query<UrlEntry>(
        `INSERT INTO url_entries (list_id, original_url, normalized_url, fetch_status, position)
         VALUES ($1,$2,$3,'pending',$4) RETURNING *`,
        [listId, originalUrl, normalizedUrl, nextPos]
      );
      return ok({ entry: mapEntry(ins.rows[0]), duplicate });
    } catch (e) {
      return err('list_not_found');
    }
  });
}

export async function updateEntry(listId: string, entryId: string, fields: { title?: string | null; description?: string | null }): Promise<Result<UrlEntry, EntryError>> {
  const sets: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) {
      sets.push(`${k} = $${idx++}`);
      values.push(v);
    }
  }
  if (sets.length === 0) {
    const current = await query<UrlEntry>(`SELECT * FROM url_entries WHERE id=$1 AND list_id=$2`, [entryId, listId]);
    if (current.rowCount === 0) return err('not_found');
    return ok(mapEntry(current.rows[0]));
  }
  values.push(entryId, listId);
  const res = await query<UrlEntry>(`UPDATE url_entries SET ${sets.join(', ')} WHERE id=$${sets.length + 1} AND list_id=$${sets.length + 2} RETURNING *`, values);
  if (res.rowCount === 0) return err('not_found');
  return ok(mapEntry(res.rows[0]));
}

export async function deleteEntry(listId: string, entryId: string): Promise<Result<UrlEntry, EntryError>> {
  const res = await query<UrlEntry>(`DELETE FROM url_entries WHERE id=$1 AND list_id=$2 RETURNING *`, [entryId, listId]);
  if (res.rowCount === 0) return err('not_found');
  return ok(mapEntry(res.rows[0]));
}
