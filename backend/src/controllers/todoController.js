const todoService = require('../services/todoService');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');

function formatTodo(t) {
  return {
    id: t.id,
    userId: t.user_id,
    categoryId: t.category_id,
    title: t.title,
    description: t.description,
    startDate: t.start_date,
    dueDate: t.due_date,
    isCompleted: t.is_completed,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  };
}

const getTodos = asyncHandler(async (req, res) => {
  const { categoryId, isCompleted, dueDateFrom, dueDateTo } = req.query;
  console.log(
    `[todo] 목록 조회 - userId: ${req.user.id}, filters: ${JSON.stringify(req.query)}`,
  );

  const filters = {};
  if (categoryId) filters.categoryId = categoryId;
  if (isCompleted !== undefined) filters.isCompleted = isCompleted === 'true';
  if (dueDateFrom) filters.dueDateFrom = dueDateFrom;
  if (dueDateTo) filters.dueDateTo = dueDateTo;

  const todos = await todoService.getTodos(req.user.id, filters);
  console.log(
    `[todo] 목록 조회 완료 - userId: ${req.user.id}, count: ${todos.length}`,
  );
  res.status(200).json({ data: todos.map(formatTodo) });
});

const createTodo = asyncHandler(async (req, res) => {
  const { categoryId, title, description, startDate, dueDate } = req.body;
  console.log(
    `[todo] 생성 요청 - userId: ${req.user.id}, title: ${title}, categoryId: ${categoryId}`,
  );

  if (!title || !title.trim()) {
    throw new AppError(400, 'VALIDATION_ERROR', '제목을 입력해주세요.');
  }
  if (!categoryId) {
    throw new AppError(400, 'VALIDATION_ERROR', '카테고리를 선택해주세요.');
  }
  if (!startDate || !dueDate) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      '시작일과 종료 예정일을 입력해주세요.',
    );
  }

  const todo = await todoService.createTodo(req.user.id, {
    categoryId,
    title: title.trim(),
    description,
    startDate,
    dueDate,
  });
  console.log(`[todo] 생성 완료 - todoId: ${todo.id}, userId: ${req.user.id}`);
  res.status(201).json({ data: formatTodo(todo) });
});

const getTodoById = asyncHandler(async (req, res) => {
  console.log(
    `[todo] 단건 조회 - userId: ${req.user.id}, todoId: ${req.params.id}`,
  );
  const todo = await todoService.getTodoById(req.user.id, req.params.id);
  res.status(200).json({ data: formatTodo(todo) });
});

const updateTodo = asyncHandler(async (req, res) => {
  console.log(
    `[todo] 수정 요청 - userId: ${req.user.id}, todoId: ${req.params.id}, fields: ${JSON.stringify(req.body)}`,
  );

  const { categoryId, title, description, startDate, dueDate, isCompleted } =
    req.body;

  const fields = {};
  if (categoryId !== undefined) fields.categoryId = categoryId;
  if (title !== undefined) fields.title = title.trim();
  if (description !== undefined) fields.description = description;
  if (startDate !== undefined) fields.startDate = startDate;
  if (dueDate !== undefined) fields.dueDate = dueDate;
  if (isCompleted !== undefined) fields.isCompleted = isCompleted;

  const todo = await todoService.updateTodo(req.user.id, req.params.id, fields);
  console.log(`[todo] 수정 완료 - todoId: ${todo.id}`);
  res.status(200).json({ data: formatTodo(todo) });
});

const deleteTodo = asyncHandler(async (req, res) => {
  console.log(
    `[todo] 삭제 요청 - userId: ${req.user.id}, todoId: ${req.params.id}`,
  );
  await todoService.deleteTodo(req.user.id, req.params.id);
  console.log(`[todo] 삭제 완료 - todoId: ${req.params.id}`);
  res.status(204).send();
});

module.exports = { getTodos, createTodo, getTodoById, updateTodo, deleteTodo };
