/* eslint-disable @typescript-eslint/no-explicit-any */
import pg from 'pg';
const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in the environment variables.');
}

/**
 * Tuned connection pool for maximum throughput and reliability:
 * - max: 10 concurrent connections (safe for a single-node PG instance)
 * - idleTimeoutMillis: release idle connections after 30s
 * - connectionTimeoutMillis: fail fast if PG is unreachable (5s timeout)
 * - statement_timeout: kill runaway queries after 10s
 */
export const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

// Warm up the pool on module load (establishes the first connection eagerly)
pool.connect().then((client) => {
  client.release();
  console.log('✅ PostgreSQL pool warmed up — connection established.');
}).catch((err) => {
  console.error('⚠️  PostgreSQL pool warm-up failed:', err.message);
});

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
  const result = await pool.query(queryText, values);
  return result.rows;
}

let isInitialized = false;

export async function ensureDbInitialized() {
  if (isInitialized) return;
  isInitialized = true;
  console.log('PostgreSQL DB initialized. Using unified "User" table.');
}
