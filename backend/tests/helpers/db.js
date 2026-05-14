const { pool } = require('../../src/db/pool');

async function cleanDb() {
  await pool.query('DELETE FROM todos');
  await pool.query('DELETE FROM categories WHERE is_default = FALSE');
  await pool.query('DELETE FROM users');
}

async function closeDb() {
  await pool.end();
}

module.exports = { cleanDb, closeDb };
