// Global setup for Jest - runs once before all test suites.
import { setupTestDb, runMigrations } from './test-db';

async function globalSetup() {
  await setupTestDb();
  await runMigrations();
}

export default globalSetup;
