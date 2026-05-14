import { describe, it, expectTypeOf } from 'vitest';
import type {
  ApiResponse,
  ApiError,
  ErrorCode,
} from '../types/api.types';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  RefreshResponse,
} from '../types/auth.types';
import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoFilters,
} from '../types/todo.types';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types';

describe('FE-02: TypeScript 타입 정의', () => {
  describe('api.types.ts', () => {
    it('ApiResponse<T>는 data 속성을 가진다', () => {
      const res: ApiResponse<string> = { data: 'test' };
      expectTypeOf(res).toHaveProperty('data');
      expectTypeOf(res.data).toBeString();
    });

    it('ApiResponse<T>는 제네릭으로 동작한다', () => {
      const numRes: ApiResponse<number> = { data: 42 };
      expectTypeOf(numRes.data).toBeNumber();

      const arrRes: ApiResponse<string[]> = { data: ['a', 'b'] };
      expectTypeOf(arrRes.data).toBeArray();
    });

    it('ApiError는 error.code와 error.message를 가진다', () => {
      const err: ApiError = {
        error: { code: 'NOT_FOUND', message: '리소스를 찾을 수 없습니다.' },
      };
      expectTypeOf(err).toHaveProperty('error');
      expectTypeOf(err.error).toHaveProperty('code');
      expectTypeOf(err.error).toHaveProperty('message');
    });

    it('ErrorCode는 6가지 값을 허용한다', () => {
      const codes: ErrorCode[] = [
        'VALIDATION_ERROR',
        'UNAUTHORIZED',
        'FORBIDDEN',
        'NOT_FOUND',
        'CONFLICT',
        'INTERNAL_ERROR',
      ];
      expectTypeOf(codes).toBeArray();
    });
  });

  describe('auth.types.ts', () => {
    it('User 타입은 필수 속성을 모두 가진다', () => {
      const user: User = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        name: '홍길동',
        createdAt: '2026-05-13T09:00:00Z',
        updatedAt: '2026-05-13T09:00:00Z',
      };
      expectTypeOf(user.id).toBeString();
      expectTypeOf(user.email).toBeString();
      expectTypeOf(user.name).toBeString();
      expectTypeOf(user.createdAt).toBeString();
      expectTypeOf(user.updatedAt).toBeString();
    });

    it('LoginRequest는 email과 password를 가진다', () => {
      const req: LoginRequest = { email: 'user@example.com', password: 'password123' };
      expectTypeOf(req.email).toBeString();
      expectTypeOf(req.password).toBeString();
    });

    it('RegisterRequest는 email, password, name을 가진다', () => {
      const req: RegisterRequest = {
        email: 'user@example.com',
        password: 'password123',
        name: '홍길동',
      };
      expectTypeOf(req.email).toBeString();
      expectTypeOf(req.password).toBeString();
      expectTypeOf(req.name).toBeString();
    });

    it('TokenResponse는 accessToken과 refreshToken을 가진다', () => {
      const token: TokenResponse = {
        accessToken: 'eyJ...',
        refreshToken: 'eyJ...',
      };
      expectTypeOf(token.accessToken).toBeString();
      expectTypeOf(token.refreshToken).toBeString();
    });

    it('RefreshResponse는 accessToken만 가진다', () => {
      const res: RefreshResponse = { accessToken: 'eyJ...' };
      expectTypeOf(res.accessToken).toBeString();
    });
  });

  describe('todo.types.ts', () => {
    it('Todo 타입은 필수 속성을 모두 가진다', () => {
      const todo: Todo = {
        id: '660e8400-e29b-41d4-a716-446655440000',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '770e8400-e29b-41d4-a716-446655440000',
        title: '결제 모듈 버그 수정',
        description: null,
        startDate: '2026-05-13',
        dueDate: '2026-05-13',
        isCompleted: false,
        createdAt: '2026-05-13T09:00:00Z',
        updatedAt: '2026-05-13T09:00:00Z',
      };
      expectTypeOf(todo.isCompleted).toBeBoolean();
      expectTypeOf(todo.description).toEqualTypeOf<string | null>();
    });

    it('Todo.description은 null 허용이다', () => {
      const todo: Todo = {
        id: '1',
        userId: '2',
        categoryId: '3',
        title: '제목',
        description: null,
        startDate: '2026-05-13',
        dueDate: '2026-05-14',
        isCompleted: false,
        createdAt: '2026-05-13T09:00:00Z',
        updatedAt: '2026-05-13T09:00:00Z',
      };
      expectTypeOf(todo.description).toEqualTypeOf<string | null>();
    });

    it('CreateTodoRequest는 필수/선택 속성을 가진다', () => {
      const withoutDesc: CreateTodoRequest = {
        title: '할일',
        categoryId: 'cat-id',
        startDate: '2026-05-13',
        dueDate: '2026-05-14',
      };
      const withDesc: CreateTodoRequest = {
        title: '할일',
        categoryId: 'cat-id',
        startDate: '2026-05-13',
        dueDate: '2026-05-14',
        description: '상세 내용',
      };
      expectTypeOf(withoutDesc.description).toEqualTypeOf<string | undefined>();
      expectTypeOf(withDesc.description).toEqualTypeOf<string | undefined>();
    });

    it('UpdateTodoRequest의 모든 속성은 선택적이다', () => {
      const empty: UpdateTodoRequest = {};
      const partial: UpdateTodoRequest = { isCompleted: true };
      const full: UpdateTodoRequest = {
        title: '새 제목',
        categoryId: 'cat-id',
        startDate: '2026-05-13',
        dueDate: '2026-05-20',
        description: '설명',
        isCompleted: false,
      };
      expectTypeOf(empty).toEqualTypeOf<UpdateTodoRequest>();
      expectTypeOf(partial).toEqualTypeOf<UpdateTodoRequest>();
      expectTypeOf(full).toEqualTypeOf<UpdateTodoRequest>();
    });

    it('TodoFilters의 모든 속성은 선택적이다', () => {
      const empty: TodoFilters = {};
      const withCategory: TodoFilters = { categoryId: 'cat-id' };
      const full: TodoFilters = {
        categoryId: 'cat-id',
        isCompleted: false,
        dueDateFrom: '2026-05-01',
        dueDateTo: '2026-05-31',
      };
      expectTypeOf(empty).toEqualTypeOf<TodoFilters>();
      expectTypeOf(withCategory.categoryId).toEqualTypeOf<string | undefined>();
      expectTypeOf(full.isCompleted).toEqualTypeOf<boolean | undefined>();
    });
  });

  describe('category.types.ts', () => {
    it('Category 타입은 필수 속성을 모두 가진다', () => {
      const defaultCat: Category = {
        id: '1',
        userId: null,
        name: '업무',
        isDefault: true,
        createdAt: '2026-05-13T09:00:00Z',
      };
      const userCat: Category = {
        id: '2',
        userId: '550e8400-e29b-41d4-a716-446655440000',
        name: '마케팅',
        isDefault: false,
        createdAt: '2026-05-13T09:00:00Z',
      };
      expectTypeOf(defaultCat.userId).toEqualTypeOf<string | null>();
      expectTypeOf(userCat.userId).toEqualTypeOf<string | null>();
      expectTypeOf(defaultCat.isDefault).toBeBoolean();
    });

    it('Category.userId는 null 허용이다 (기본 카테고리)', () => {
      const cat: Category = {
        id: '1',
        userId: null,
        name: '업무',
        isDefault: true,
        createdAt: '2026-05-13T09:00:00Z',
      };
      expectTypeOf(cat.userId).toEqualTypeOf<string | null>();
    });

    it('CreateCategoryRequest는 name만 가진다', () => {
      const req: CreateCategoryRequest = { name: '마케팅' };
      expectTypeOf(req.name).toBeString();
    });

    it('UpdateCategoryRequest는 name만 가진다', () => {
      const req: UpdateCategoryRequest = { name: '마케팅팀' };
      expectTypeOf(req.name).toBeString();
    });
  });
});
