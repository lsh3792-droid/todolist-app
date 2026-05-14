const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} = require('../utils/tokenHelper');
const { AppError } = require('../utils/AppError');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

async function register({ email, password, name }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new AppError(409, 'CONFLICT', '이미 사용 중인 이메일입니다.');
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create({ email, password: hashed, name });

  const accessToken = signAccessToken({ id: user.id, email: user.email });
  const refreshToken = signRefreshToken({ id: user.id, email: user.email });

  return { accessToken, refreshToken };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError(
      401,
      'UNAUTHORIZED',
      '이메일 또는 비밀번호가 올바르지 않습니다.',
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(
      401,
      'UNAUTHORIZED',
      '이메일 또는 비밀번호가 올바르지 않습니다.',
    );
  }

  const accessToken = signAccessToken({ id: user.id, email: user.email });
  const refreshToken = signRefreshToken({ id: user.id, email: user.email });

  return { accessToken, refreshToken };
}

async function refresh({ refreshToken }) {
  const payload = verifyToken(refreshToken);
  const accessToken = signAccessToken({ id: payload.id, email: payload.email });
  return { accessToken };
}

module.exports = { register, login, refresh };
