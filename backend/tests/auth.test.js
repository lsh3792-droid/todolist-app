require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { cleanDb, closeDb } = require('./helpers/db');

const BASE = '/api/auth';

const validUser = {
  email: 'auth_test@example.com',
  password: 'password123',
  name: '테스트유저',
};

beforeEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
  await closeDb();
});

describe('POST /api/auth/register', () => {
  it('정상 회원가입 시 201과 토큰 반환', async () => {
    const res = await request(app).post(`${BASE}/register`).send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('중복 이메일 회원가입 시 409 CONFLICT', async () => {
    await request(app).post(`${BASE}/register`).send(validUser);
    const res = await request(app).post(`${BASE}/register`).send(validUser);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('이메일 형식 오류 시 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...validUser, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('비밀번호 8자 미만 시 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...validUser, password: '1234567' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post(`${BASE}/register`).send(validUser);
  });

  it('정상 로그인 시 200과 토큰 반환', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: validUser.email, password: validUser.password });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('비밀번호 불일치 시 401 (이메일 존재 여부 미노출)', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: validUser.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('존재하지 않는 이메일 로그인 시 401', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: 'nobody@example.com', password: validUser.password });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('POST /api/auth/refresh', () => {
  it('유효한 Refresh Token으로 새 Access Token 발급', async () => {
    const reg = await request(app).post(`${BASE}/register`).send(validUser);
    const { refreshToken } = reg.body.data;

    const res = await request(app).post(`${BASE}/refresh`).send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('만료/유효하지 않은 Refresh Token 시 401', async () => {
    const res = await request(app)
      .post(`${BASE}/refresh`)
      .send({ refreshToken: 'invalid.token.here' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('인증 보호 엔드포인트', () => {
  it('토큰 없이 보호 엔드포인트 접근 시 401', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('유효하지 않은 토큰으로 접근 시 401', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalid.token.value');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
