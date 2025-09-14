// Test database bootstrap (T005)
// Future enhancement: create an isolated schema per test run to allow parallelization.
// For now, this is a placeholder that will later run migrations.

import { query, closePool } from '../../lib/db';
import { execSync } from 'child_process';

export async function setupTestDb() {
  // Placeholder: ensure connection works.
  try {
    await query('SELECT 1');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Test DB connectivity failed:', err);
    throw err;
  }
}

export async function teardownTestDb() {
  await closePool();
}

export async function runMigrations() {
  // Execute migration script via node (tsx). Using execSync for simplicity here.
  try {
    execSync('pnpm exec tsx scripts/run-migrations.ts', { stdio: 'inherit' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Migration run failed', err);
    throw err;
  }
}

export async function truncateAll() {
  // Truncate tables in correct order to keep FK constraints happy.
  await query('TRUNCATE TABLE url_entries, actions_log, lists RESTART IDENTITY CASCADE');
}
