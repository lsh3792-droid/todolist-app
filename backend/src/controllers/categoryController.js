const categoryService = require('../services/categoryService');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');

function formatCategory(c) {
  return {
    id: c.id,
    name: c.name,
    isDefault: c.is_default,
    userId: c.user_id,
    createdAt: c.created_at,
  };
}

const getCategories = asyncHandler(async (req, res) => {
  console.log(`[category] 목록 조회 - userId: ${req.user.id}`);
  const categories = await categoryService.getCategories(req.user.id);
  console.log(
    `[category] 목록 조회 완료 - userId: ${req.user.id}, count: ${categories.length}`,
  );
  res.status(200).json({ data: categories.map(formatCategory) });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  console.log(`[category] 생성 요청 - userId: ${req.user.id}, name: ${name}`);
  if (!name || !name.trim()) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      '카테고리 이름을 입력해주세요.',
    );
  }

  const category = await categoryService.createCategory(req.user.id, {
    name: name.trim(),
  });
  console.log(
    `[category] 생성 완료 - categoryId: ${category.id}, name: ${category.name}`,
  );
  res.status(201).json({ data: formatCategory(category) });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  console.log(
    `[category] 수정 요청 - userId: ${req.user.id}, categoryId: ${req.params.id}, name: ${name}`,
  );
  if (!name || !name.trim()) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      '카테고리 이름을 입력해주세요.',
    );
  }

  const category = await categoryService.updateCategory(
    req.user.id,
    req.params.id,
    { name: name.trim() },
  );
  console.log(`[category] 수정 완료 - categoryId: ${category.id}`);
  res.status(200).json({ data: formatCategory(category) });
});

const deleteCategory = asyncHandler(async (req, res) => {
  console.log(
    `[category] 삭제 요청 - userId: ${req.user.id}, categoryId: ${req.params.id}`,
  );
  await categoryService.deleteCategory(req.user.id, req.params.id);
  console.log(`[category] 삭제 완료 - categoryId: ${req.params.id}`);
  res.status(204).send();
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
