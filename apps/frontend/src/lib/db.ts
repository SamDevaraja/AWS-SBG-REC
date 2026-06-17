/* eslint-disable @typescript-eslint/no-explicit-any */
import pg from 'pg';
const { Pool } = pg;

// Reuse connection pool in development to prevent leaks across HMR reloads
const globalForDb = globalThis as unknown as {
  pool: pg.Pool | undefined;
};

export function getPool(): pg.Pool {
  if (globalForDb.pool) return globalForDb.pool;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in the environment variables.');
  }

  const poolInstance = new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForDb.pool = poolInstance;
  }

  // Warm up the pool asynchronously
  poolInstance.connect().then((client) => {
    client.release();
    console.log('✅ PostgreSQL pool warmed up — connection established.');
  }).catch((err) => {
    console.error('⚠️  PostgreSQL pool warm-up failed:', err.message);
  });

  return poolInstance;
}

/**
 * Template literal tag for parameterized SQL queries.
 * Prevents SQL injection and reuses the connection pool efficiently.
 */
export async function sql(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<any[]> {
  let queryText = '';
  for (let i = 0; i < strings.length; i++) {
    queryText += strings[i];
    if (i < values.length) {
      queryText += `$${i + 1}`;
    }
  }
  const result = await getPool().query(queryText, values);
  return result.rows;
}

let isInitialized = false;

export async function ensureDbInitialized() {
  if (isInitialized) return;
  isInitialized = true;
  console.log('PostgreSQL DB initialized. Using unified "User" table.');
}

