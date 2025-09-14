// Metadata enrichment worker (T043)
// Simple in-process polling worker. In a real deployment this would be a separate queue/worker process.
// Strategy:
// - poll for entries with fetch_status='pending'
// - attempt fetchMetadata (placeholder logic) and update row to success/failed/timeout
// - backoff when no work

import { getConfig } from '@/lib/config';
import { query } from '@/lib/db';
import { fetchMetadata } from '@/lib/metadata-fetch';
import { logger } from '@/lib/logger';

let running = false;
let started = false;

export interface MetadataWorkerOptions {
  intervalMs?: number;
  batchSize?: number;
}

export function startMetadataWorker(opts: MetadataWorkerOptions = {}) {
  if (started) return; // idempotent
  started = true;
  const intervalMs = opts.intervalMs ?? 500;
  const batchSize = opts.batchSize ?? 5;
  running = true;
  let loopHandle: NodeJS.Timeout | null = null;

  (async function loop() {
    while (running) {
      try {
        const pending = await query<any>(
          `SELECT id, original_url FROM url_entries WHERE fetch_status='pending' ORDER BY created_at ASC LIMIT $1`,
          [batchSize]
        );
        if (pending.rowCount === 0) {
          await sleep(intervalMs);
          continue;
        }
        for (const row of pending.rows) {
          const url = row.original_url;
          const meta = await fetchMetadata(url);
          let status = meta.status;
          let title = meta.title ?? null;
          let description = meta.description ?? null;
          if (status === 'pending') {
            // Placeholder fetchMetadata currently returns pending; treat as success no-op.
            status = 'success';
          }
          await query(
            `UPDATE url_entries SET fetch_status=$1, title=COALESCE($2,title), description=COALESCE($3,description), updated_at=NOW() WHERE id=$4`,
            [status, title, description, row.id]
          );
        }
      } catch (err: any) {
        logger.error('metadata_worker_error', { error: err.message || String(err) });
        await sleep(intervalMs * 2);
      }
    }
  })();

  // Return a stopper for convenience
  return () => { running = false; };
}

export function stopMetadataWorker() { running = false; }

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
