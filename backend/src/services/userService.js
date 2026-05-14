const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const { AppError } = require('../utils/AppError');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', '사용자를 찾을 수 없습니다.');
  }
  return user;
}

async function updateMe(userId, { name, currentPassword, newPassword }) {
  const fields = {};

  if (name !== undefined) {
    if (!name.trim()) {
      throw new AppError(400, 'VALIDATION_ERROR', '이름을 입력해주세요.');
    }
    fields.name = name.trim();
  }

  if (newPassword !== undefined) {
    if (!currentPassword) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        '현재 비밀번호를 입력해주세요.',
      );
    }
    if (newPassword.length < 8) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        '새 비밀번호는 최소 8자 이상이어야 합니다.',
      );
    }

    const userWithPw = await userRepository.findByEmail(
      (await userRepository.findById(userId)).email,
    );
    const isMatch = await bcrypt.compare(currentPassword, userWithPw.password);
    if (!isMatch) {
      throw new AppError(
        401,
        'UNAUTHORIZED',
        '현재 비밀번호가 올바르지 않습니다.',
      );
    }

    fields.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  }

  return userRepository.update(userId, fields);
}

async function deleteMe(userId) {
  await userRepository.remove(userId);
}

module.exports = { getMe, updateMe, deleteMe };
