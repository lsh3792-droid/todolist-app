export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export type RefreshResponse = {
  accessToken: string;
};
