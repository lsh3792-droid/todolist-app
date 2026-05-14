require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { cleanDb, closeDb } = require('./helpers/db');

const AUTH = '/api/auth';
const CATEGORIES = '/api/categories';

async function registerAndLogin(suffix = '') {
  const user = {
    email: `cat_user${suffix}@example.com`,
    password: 'password123',
    name: `카테고리유저${suffix}`,
  };
  const res = await request(app).post(`${AUTH}/register`).send(user);
  return res.body.data.accessToken;
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

beforeEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
  await closeDb();
});

describe('GET /api/categories', () => {
  it('기본 카테고리 3종 포함 반환', async () => {
    const token = await registerAndLogin();
    const res = await request(app).get(CATEGORIES).set(authHeader(token));
    expect(res.status).toBe(200);
    const defaults = res.body.data.filter((c) => c.isDefault);
    expect(defaults.length).toBe(3);
  });
});

describe('POST /api/categories', () => {
  it('정상 생성 시 201 반환', async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post(CATEGORIES)
      .set(authHeader(token))
      .send({ name: '운동' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('운동');
    expect(res.body.data.isDefault).toBe(false);
  });

  it('동일 사용자 내 중복 카테고리명 생성 시 409 CONFLICT', async () => {
    const token = await registerAndLogin();
    await request(app).post(CATEGORIES).set(authHeader(token)).send({ name: '독서' });
    const res = await request(app).post(CATEGORIES).set(authHeader(token)).send({ name: '독서' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });
});

describe('PATCH /api/categories/:id', () => {
  it('정상 수정 시 200 반환', async () => {
    const token = await registerAndLogin();
    const create = await request(app)
      .post(CATEGORIES)
      .set(authHeader(token))
      .send({ name: '수정전' });
    const id = create.body.data.id;

    const res = await request(app)
      .patch(`${CATEGORIES}/${id}`)
      .set(authHeader(token))
      .send({ name: '수정후' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('수정후');
  });

  it('기본 카테고리 수정 시도 시 403 FORBIDDEN', async () => {
    const token = await registerAndLogin();
    const list = await request(app).get(CATEGORIES).set(authHeader(token));
    const defaultCat = list.body.data.find((c) => c.isDefault);

    const res = await request(app)
      .patch(`${CATEGORIES}/${defaultCat.id}`)
      .set(authHeader(token))
      .send({ name: '변경시도' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('타인의 카테고리 수정 시도 시 403 FORBIDDEN', async () => {
    const token1 = await registerAndLogin('_a');
    const token2 = await registerAndLogin('_b');

    const create = await request(app)
      .post(CATEGORIES)
      .set(authHeader(token1))
      .send({ name: '유저1카테고리' });
    const id = create.body.data.id;

    const res = await request(app)
      .patch(`${CATEGORIES}/${id}`)
      .set(authHeader(token2))
      .send({ name: '탈취시도' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

describe('DELETE /api/categories/:id', () => {
  it('정상 삭제 시 204 반환', async () => {
    const token = await registerAndLogin();
    const create = await request(app)
      .post(CATEGORIES)
      .set(authHeader(token))
      .send({ name: '삭제용' });
    const id = create.body.data.id;

    const res = await request(app).delete(`${CATEGORIES}/${id}`).set(authHeader(token));
    expect(res.status).toBe(204);
  });

  it('기본 카테고리 삭제 시도 시 403 FORBIDDEN', async () => {
    const token = await registerAndLogin();
    const list = await request(app).get(CATEGORIES).set(authHeader(token));
    const defaultCat = list.body.data.find((c) => c.isDefault);

    const res = await request(app)
      .delete(`${CATEGORIES}/${defaultCat.id}`)
      .set(authHeader(token));
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('타인의 카테고리 삭제 시도 시 403 FORBIDDEN', async () => {
    const token1 = await registerAndLogin('_c');
    const token2 = await registerAndLogin('_d');

    const create = await request(app)
      .post(CATEGORIES)
      .set(authHeader(token1))
      .send({ name: '유저1카테고리2' });
    const id = create.body.data.id;

    const res = await request(app).delete(`${CATEGORIES}/${id}`).set(authHeader(token2));
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('할일이 연결된 카테고리 삭제 시도 시 409 CONFLICT', async () => {
    const token = await registerAndLogin();

    const catRes = await request(app)
      .post(CATEGORIES)
      .set(authHeader(token))
      .send({ name: '연결카테고리' });
    const categoryId = catRes.body.data.id;

    await request(app)
      .post('/api/todos')
      .set(authHeader(token))
      .send({
        title: '연결된 할일',
        categoryId,
        startDate: '2026-05-13',
        dueDate: '2026-05-14',
      });

    const res = await request(app).delete(`${CATEGORIES}/${categoryId}`).set(authHeader(token));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });
});
