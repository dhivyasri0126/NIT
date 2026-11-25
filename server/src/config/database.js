import pkg from 'pg';
const { Pool } = pkg;
import { config } from './environment.js';

if (!config.databaseUrl) {
  console.error('FATAL: DATABASE_URL is not configured in environment.');
  process.exit(1);
}

// Neon PostgreSQL connection pool
export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', (client) => {
  // Ensure every client session operates in the 'erp' schema
  client.query(`SET search_path TO ${config.dbSchema}, public`);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

/**
 * Execute query with automatic schema search path
 */
export const query = async (text, params = []) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (config.nodeEnv === 'development' && duration > 500) {
    console.warn(`[SLOW QUERY] (${duration}ms): ${text}`);
  }
  return res;
};

/**
 * Transaction wrapper helper
 */
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET search_path TO ${config.dbSchema}, public`);
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Test database connectivity
 */
export const testConnection = async () => {
  try {
    const res = await pool.query('SELECT version(), current_schema()');
    console.log('✓ PostgreSQL connected successfully.');
    console.log(`✓ Engine: ${res.rows[0].version.split(' ')[0]} ${res.rows[0].version.split(' ')[1]}`);
    console.log(`✓ Active Schema: ${res.rows[0].current_schema}`);
    return true;
  } catch (err) {
    console.error('✗ Failed to connect to PostgreSQL:', err.message);
    throw err;
  }
};
