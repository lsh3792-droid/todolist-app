const todoRepository = require('../repositories/todoRepository');
const categoryRepository = require('../repositories/categoryRepository');
const { AppError } = require('../utils/AppError');

async function getTodos(userId, filters) {
  return todoRepository.findAllByUserId(userId, filters);
}

async function createTodo(
  userId,
  { categoryId, title, description, startDate, dueDate },
) {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new AppError(404, 'NOT_FOUND', '카테고리를 찾을 수 없습니다.');
  }
  if (!category.is_default && category.user_id !== userId) {
    throw new AppError(404, 'NOT_FOUND', '카테고리를 찾을 수 없습니다.');
  }

  if (new Date(dueDate) < new Date(startDate)) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      '종료 예정일은 시작일보다 이전일 수 없습니다.',
    );
  }

  return todoRepository.create({
    userId,
    categoryId,
    title,
    description,
    startDate,
    dueDate,
  });
}

async function getTodoById(userId, todoId) {
  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    throw new AppError(404, 'NOT_FOUND', '할일을 찾을 수 없습니다.');
  }
  if (todo.user_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', '할일에 접근할 권한이 없습니다.');
  }
  return todo;
}

async function updateTodo(userId, todoId, fields) {
  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    throw new AppError(404, 'NOT_FOUND', '할일을 찾을 수 없습니다.');
  }
  if (todo.user_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', '할일을 수정할 권한이 없습니다.');
  }

  const startDate = fields.startDate ?? todo.start_date;
  const dueDate = fields.dueDate ?? todo.due_date;
  if (new Date(dueDate) < new Date(startDate)) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      '종료 예정일은 시작일보다 이전일 수 없습니다.',
    );
  }

  return todoRepository.update(todoId, fields);
}

async function deleteTodo(userId, todoId) {
  const todo = await todoRepository.findById(todoId);
  if (!todo) {
    throw new AppError(404, 'NOT_FOUND', '할일을 찾을 수 없습니다.');
  }
  if (todo.user_id !== userId) {
    throw new AppError(403, 'FORBIDDEN', '할일을 삭제할 권한이 없습니다.');
  }
  await todoRepository.remove(todoId);
}

module.exports = { getTodos, createTodo, getTodoById, updateTodo, deleteTodo };
