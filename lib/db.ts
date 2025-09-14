import { Pool, PoolClient, QueryResult } from 'pg';
import { getConfig } from './config';

// Initialize a shared connection pool. Config is lazy to avoid env loading before it's defined.
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const cfg = getConfig();
    pool = new Pool({
      connectionString: cfg.DATABASE_URL,
      max: 10, // sensible default for small service
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
    pool.on('error', (err: Error) => {
      // Log & rely on process manager to restart if needed.
      console.error(JSON.stringify({ level: 'error', msg: 'pg pool error', err: err.message }));
    });
  }
  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}

export interface Transaction {
  client: PoolClient;
  query: <T = any>(text: string, params?: any[]) => Promise<QueryResult<T>>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
}

export async function withTransaction<T>(fn: (trx: Transaction) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  let finished = false;
  try {
    await client.query('BEGIN');
    const trx: Transaction = {
      client,
      query: (text, params) => client.query(text, params),
      commit: async () => {
        if (!finished) {
          await client.query('COMMIT');
          finished = true;
        }
      },
      rollback: async () => {
        if (!finished) {
          await client.query('ROLLBACK');
          finished = true;
        }
      },
    };
    const result = await fn(trx);
    await trx.commit();
    return result;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch { /* ignore */ }
    throw err;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
