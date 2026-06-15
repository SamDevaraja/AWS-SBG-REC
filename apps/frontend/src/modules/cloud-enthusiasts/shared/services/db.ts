import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('[DB] DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');

const globalForEnthusiastDb = globalThis as unknown as {
  enthusiastPool: Pool | undefined;
};

export const pool = globalForEnthusiastDb.enthusiastPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

if (process.env.NODE_ENV !== 'production') {
  globalForEnthusiastDb.enthusiastPool = pool;
}

pool.on('connect', () => {
  console.log('[DB] New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err);
});

export const query = async (text: string, params?: unknown[]) => {
  console.log('[DB] Executing query:', text.substring(0, 80) + '...');
  const result = await pool.query(text, params);
  console.log('[DB] Query returned', result.rows.length, 'rows');
  return result;
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export default pool;
