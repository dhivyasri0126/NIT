import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, testConnection } from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  console.log('--- Starting PostgreSQL Benchmark Seeding (Schema erp) ---');
  await testConnection();

  const sqlPath = path.join(__dirname, 'seed.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Executing seed script...');
    await client.query(sql);
    console.log('✓ Seeding executed successfully! All benchmark data loaded.');
  } catch (error) {
    console.error('✗ Seeding error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
