const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * Run a parameterised query and return the result rows.
 */
async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

/**
 * Initialize the database by running schema.sql.
 * Called once at server startup.
 */
async function init() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(sql);
  console.log('PostgreSQL schema initialised');
}

module.exports = { query, pool, init };
