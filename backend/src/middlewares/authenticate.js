const { verifyToken } = require('../utils/tokenHelper');
const { AppError } = require('../utils/AppError');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', '인증 토큰이 없습니다.'));
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate };
