import { query } from '../db';
import { ActionsLogRow, ok, Result } from './types';

export async function logAction(listId: string, event: 'publish' | 'delete', slug: string | null): Promise<Result<ActionsLogRow>> {
  const res = await query<ActionsLogRow>(
    `INSERT INTO actions_log (list_id, event, slug) VALUES ($1,$2,$3) RETURNING *`,
    [listId, event, slug]
  );
  return ok(res.rows[0]);
}

export async function listActions(listId: string): Promise<Result<ActionsLogRow[]>> {
  const res = await query<ActionsLogRow>(`SELECT * FROM actions_log WHERE list_id=$1 ORDER BY id ASC`, [listId]);
  return ok(res.rows);
}
