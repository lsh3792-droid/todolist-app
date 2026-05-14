export type Todo = {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string | null;
  startDate: string;
  dueDate: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTodoRequest = {
  title: string;
  categoryId: string;
  startDate: string;
  dueDate: string;
  description?: string;
};

export type UpdateTodoRequest = Partial<{
  title: string;
  categoryId: string;
  startDate: string;
  dueDate: string;
  description: string;
  isCompleted: boolean;
}>;

export type TodoFilters = Partial<{
  categoryId: string;
  isCompleted: boolean;
  dueDateFrom: string;
  dueDateTo: string;
}>;
