const jwt = require('jsonwebtoken');
const { AppError } = require('./AppError');

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError(
      401,
      'UNAUTHORIZED',
      '유효하지 않거나 만료된 토큰입니다.',
    );
  }
}

module.exports = { signAccessToken, signRefreshToken, verifyToken };
