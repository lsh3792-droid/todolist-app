export type Category = {
  id: string;
  userId: string | null;
  name: string;
  isDefault: boolean;
  createdAt: string;
};

export type CreateCategoryRequest = {
  name: string;
};

export type UpdateCategoryRequest = {
  name: string;
};
