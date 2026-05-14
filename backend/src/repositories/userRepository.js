const { pool } = require('../db/pool');

async function findByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, email, password, name, created_at FROM users WHERE email = $1',
    [email],
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, email, name, created_at FROM users WHERE id = $1',
    [id],
  );
  return rows[0] || null;
}

async function create({ email, password, name }) {
  const { rows } = await pool.query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
    [email, password, name],
  );
  return rows[0];
}

async function update(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return findById(id);

  const setClauses = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
  const values = keys.map((key) => fields[key]);

  const { rows } = await pool.query(
    `UPDATE users SET ${setClauses} WHERE id = $1 RETURNING id, email, name, created_at`,
    [id, ...values],
  );
  return rows[0] || null;
}

async function remove(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = { findByEmail, findById, create, update, remove };
