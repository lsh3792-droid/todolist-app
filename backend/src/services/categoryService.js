const categoryRepository = require('../repositories/categoryRepository');
const { AppError } = require('../utils/AppError');

async function getCategories(userId) {
  return categoryRepository.findAllByUser(userId);
}

async function createCategory(userId, { name }) {
  const existing = await categoryRepository.findAllByUser(userId);
  const duplicate = existing.find(
    (c) => c.name === name && (c.user_id === userId || c.is_default),
  );
  if (duplicate) {
    throw new AppError(409, 'CONFLICT', '이미 존재하는 카테고리 이름입니다.');
  }

  return categoryRepository.create({ userId, name });
}

async function updateCategory(userId, categoryId, { name }) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new AppError(404, 'NOT_FOUND', '카테고리를 찾을 수 없습니다.');
  }
  if (category.is_default) {
    throw new AppError(403, 'FORBIDDEN', '기본 카테고리는 수정할 수 없습니다.');
  }
  if (category.user_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', '카테고리를 수정할 권한이 없습니다.');
  }

  const existing = await categoryRepository.findAllByUser(userId);
  const duplicate = existing.find(
    (c) => c.name === name && c.id !== categoryId,
  );
  if (duplicate) {
    throw new AppError(409, 'CONFLICT', '이미 존재하는 카테고리 이름입니다.');
  }

  return categoryRepository.update(categoryId, { name });
}

async function deleteCategory(userId, categoryId) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new AppError(404, 'NOT_FOUND', '카테고리를 찾을 수 없습니다.');
  }
  if (category.is_default) {
    throw new AppError(403, 'FORBIDDEN', '기본 카테고리는 삭제할 수 없습니다.');
  }
  if (category.user_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', '카테고리를 삭제할 권한이 없습니다.');
  }

  const linked = await categoryRepository.hasTodos(categoryId);
  if (linked) {
    throw new AppError(
      409,
      'CONFLICT',
      '할일이 연결된 카테고리는 삭제할 수 없습니다.',
    );
  }

  await categoryRepository.remove(categoryId);
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
