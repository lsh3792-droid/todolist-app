const authService = require('../services/authService');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  console.log(`[auth] 회원가입 요청 - email: ${email}`);

  if (!email || !EMAIL_RE.test(email)) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      '유효한 이메일을 입력해주세요.',
    );
  }
  if (!password || password.length < 8) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      '비밀번호는 최소 8자 이상이어야 합니다.',
    );
  }
  if (!name || !name.trim()) {
    throw new AppError(400, 'VALIDATION_ERROR', '이름을 입력해주세요.');
  }

  const data = await authService.register({
    email,
    password,
    name: name.trim(),
  });
  console.log(
    `[auth] 회원가입 완료 - userId: ${data.user?.id}, email: ${email}`,
  );
  res.status(201).json({ data });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(`[auth] 로그인 요청 - email: ${email}`);

  if (!email || !password) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      '이메일과 비밀번호를 입력해주세요.',
    );
  }

  const data = await authService.login({ email, password });
  console.log(`[auth] 로그인 성공 - email: ${email}`);
  res.status(200).json({ data });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  console.log('[auth] 토큰 갱신 요청');

  if (!refreshToken) {
    throw new AppError(400, 'VALIDATION_ERROR', 'refreshToken을 입력해주세요.');
  }

  const data = await authService.refresh({ refreshToken });
  console.log('[auth] 토큰 갱신 완료');
  res.status(200).json({ data });
});

module.exports = { register, login, refreshToken };
