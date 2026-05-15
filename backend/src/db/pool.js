const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * DB 연결을 검증한다. 실패 시 에러 로깅 후 프로세스를 종료한다.
 * @returns {Promise<void>}
 */
async function connectDB() {
  try {
    await pool.query('SELECT 1');
    console.log('[DB] PostgreSQL 연결 성공');
  } catch (err) {
    console.error('[DB] PostgreSQL 연결 실패:', err.message);
    process.exit(1);
  }
}

module.exports = { pool, connectDB };
