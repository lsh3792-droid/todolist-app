const REQUIRED_VARS = ['DATABASE_URL', 'JWT_SECRET', 'CORS_ALLOWED_ORIGIN'];

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `[환경변수 오류] 필수 환경변수가 누락되었습니다: ${missing.join(', ')}`,
    );
    process.exit(1);
  }
}

module.exports = { validateEnv };
