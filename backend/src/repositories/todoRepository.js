const { pool } = require('../db/pool');

async function findAllByUserId(userId, filters = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];
  let idx = 2;

  if (filters.categoryId !== undefined) {
    conditions.push(`category_id = $${idx++}`);
    params.push(filters.categoryId);
  }
  if (filters.isCompleted !== undefined) {
    conditions.push(`is_completed = $${idx++}`);
    params.push(filters.isCompleted);
  }
  if (filters.dueDateFrom !== undefined) {
    conditions.push(`due_date >= $${idx++}`);
    params.push(filters.dueDateFrom);
  }
  if (filters.dueDateTo !== undefined) {
    conditions.push(`due_date <= $${idx++}`);
    params.push(filters.dueDateTo);
  }

  const where = conditions.join(' AND ');
  const { rows } = await pool.query(
    `SELECT id, user_id, category_id, title, description, start_date, due_date, is_completed, created_at, updated_at
     FROM todos
     WHERE ${where}
     ORDER BY created_at DESC`,
    params,
  );
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, user_id, category_id, title, description, start_date, due_date, is_completed, created_at, updated_at
     FROM todos WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
}

async function create({
  userId,
  categoryId,
  title,
  description,
  startDate,
  dueDate,
}) {
  const { rows } = await pool.query(
    `INSERT INTO todos (user_id, category_id, title, description, start_date, due_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, category_id, title, description, start_date, due_date, is_completed, created_at, updated_at`,
    [userId, categoryId, title, description || null, startDate, dueDate],
  );
  return rows[0];
}

async function update(id, fields) {
  const COLUMN_MAP = {
    categoryId: 'category_id',
    title: 'title',
    description: 'description',
    startDate: 'start_date',
    dueDate: 'due_date',
    isCompleted: 'is_completed',
  };

  const keys = Object.keys(fields).filter((k) => COLUMN_MAP[k] !== undefined);
  if (keys.length === 0) return findById(id);

  const setClauses = keys
    .map((k, i) => `${COLUMN_MAP[k]} = $${i + 2}`)
    .join(', ');
  const values = keys.map((k) => fields[k]);

  const { rows } = await pool.query(
    `UPDATE todos SET ${setClauses} WHERE id = $1
     RETURNING id, user_id, category_id, title, description, start_date, due_date, is_completed, created_at, updated_at`,
    [id, ...values],
  );
  return rows[0] || null;
}

async function remove(id) {
  await pool.query('DELETE FROM todos WHERE id = $1', [id]);
}

module.exports = { findAllByUserId, findById, create, update, remove };
