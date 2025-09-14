// Global teardown for Jest - runs once after all test suites complete.
import { teardownTestDb } from './test-db';

async function globalTeardown() {
  await teardownTestDb();
}

export default globalTeardown;
