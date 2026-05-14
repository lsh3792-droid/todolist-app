const { pool } = require('../db/pool');

async function findAllByUser(userId) {
  const { rows } = await pool.query(
    `SELECT id, user_id, name, is_default, created_at
     FROM categories
     WHERE user_id IS NULL OR user_id = $1
     ORDER BY is_default DESC, created_at ASC`,
    [userId],
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, user_id, name, is_default, created_at FROM categories WHERE id = $1',
    [id],
  );
  return rows[0] || null;
}

async function create({ userId, name }) {
  const { rows } = await pool.query(
    'INSERT INTO categories (user_id, name, is_default) VALUES ($1, $2, FALSE) RETURNING id, user_id, name, is_default, created_at',
    [userId, name],
  );
  return rows[0];
}

async function update(id, { name }) {
  const { rows } = await pool.query(
    'UPDATE categories SET name = $2 WHERE id = $1 RETURNING id, user_id, name, is_default, created_at',
    [id, name],
  );
  return rows[0] || null;
}

async function remove(id) {
  await pool.query('DELETE FROM categories WHERE id = $1', [id]);
}

async function hasTodos(id) {
  const { rows } = await pool.query(
    'SELECT 1 FROM todos WHERE category_id = $1 LIMIT 1',
    [id],
  );
  return rows.length > 0;
}

module.exports = { findAllByUser, findById, create, update, remove, hasTodos };
