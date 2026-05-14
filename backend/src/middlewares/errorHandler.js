const { AppError } = require('../utils/AppError');

function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    console.warn(
      `[error] ${req.method} ${req.path} - ${err.statusCode} ${err.code}: ${err.message}`,
    );
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  console.error(`[error] ${req.method} ${req.path} - 500 INTERNAL_ERROR:`, err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: '서버 내부 오류가 발생했습니다.',
    },
  });
}

module.exports = { errorHandler };
