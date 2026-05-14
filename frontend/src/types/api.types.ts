export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export type ApiResponse<T> = { data: T };

export type ApiError = {
  error: {
    code: ErrorCode;
    message: string;
  };
};
