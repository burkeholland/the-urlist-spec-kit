#!/usr/bin/env ts-node
/**
 * Simple migration runner: executes all .sql files in migrations/ in filename order.
 * Idempotency is assumed via transactional DDL; do NOT modify applied files—create new ones instead.
 */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import { getConfig } from '../lib/config';

async function run() {
  const cfg = getConfig();
  const client = new Client({ connectionString: cfg.DATABASE_URL });
  await client.connect();
  try {
    const dir = join(process.cwd(), 'migrations');
    const files = readdirSync(dir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    // Ensure tracking table exists
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (filename text primary key, applied_at timestamptz default now())`);
  const appliedRes = await client.query<{ filename: string }>(`SELECT filename FROM schema_migrations`);
  const applied = new Set(appliedRes.rows.map((r: { filename: string }) => r.filename));
    const DUPLICATE_ERROR_CODES = new Set(['42P07','42710','42P16']); // table, object, function already exists
    for (const f of files) {
      if (applied.has(f)) {
        process.stdout.write(`\n>>> Skipping already applied migration ${f}`);
        continue;
      }
      const sql = readFileSync(join(dir, f), 'utf8');
      process.stdout.write(`\n>>> Applying migration ${f}\n`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [f]);
        await client.query('COMMIT');
        process.stdout.write(`>>> Applied ${f}\n`);
      } catch (err) {
        await client.query('ROLLBACK');
        const pgErr = err as any;
        if (pgErr?.code && DUPLICATE_ERROR_CODES.has(pgErr.code)) {
          process.stdout.write(`>>> Detected duplicate object errors in ${f}; marking as applied (dev idempotency)\n`);
          await client.query('INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [f]);
          continue;
        }
        if ((err as Error).message.includes('already exists')) {
          process.stdout.write(`>>> Detected 'already exists' message in ${f}; marking as applied (dev idempotency)\n`);
          await client.query('INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [f]);
          continue;
        }
        throw new Error(`Migration failed (${f}): ${(err as Error).message}`);
      }
    }
    process.stdout.write('\nAll migrations applied successfully.\n');
  } finally {
    await client.end();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
