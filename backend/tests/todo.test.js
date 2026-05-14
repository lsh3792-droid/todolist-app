require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { cleanDb, closeDb } = require('./helpers/db');

const AUTH = '/api/auth';
const TODOS = '/api/todos';
const CATEGORIES = '/api/categories';

async function registerAndLogin(suffix = '') {
  const user = {
    email: `todo_user${suffix}@example.com`,
    password: 'password123',
    name: `투두유저${suffix}`,
  };
  const res = await request(app).post(`${AUTH}/register`).send(user);
  return res.body.data.accessToken;
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

async function getDefaultCategoryId(token) {
  const res = await request(app).get(CATEGORIES).set(authHeader(token));
  return res.body.data.find((c) => c.isDefault).id;
}

async function createUserCategory(token, name = '테스트카테고리') {
  const res = await request(app)
    .post(CATEGORIES)
    .set(authHeader(token))
    .send({ name });
  return res.body.data.id;
}

beforeEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
  await closeDb();
});

describe('POST /api/todos', () => {
  it('정상 생성 시 201 반환', async () => {
    const token = await registerAndLogin();
    const categoryId = await getDefaultCategoryId(token);

    const res = await request(app)
      .post(TODOS)
      .set(authHeader(token))
      .send({ title: '할일1', categoryId, startDate: '2026-05-13', dueDate: '2026-05-14' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('할일1');
    expect(res.body.data.isCompleted).toBe(false);
  });

  it('dueDate < startDate 인 경우 400 VALIDATION_ERROR', async () => {
    const token = await registerAndLogin();
    const categoryId = await getDefaultCategoryId(token);

    const res = await request(app)
      .post(TODOS)
      .set(authHeader(token))
      .send({ title: '날짜오류', categoryId, startDate: '2026-05-14', dueDate: '2026-05-13' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('타인의 categoryId로 Todo 등록 시도 시 404 NOT_FOUND', async () => {
    const token1 = await registerAndLogin('_a');
    const token2 = await registerAndLogin('_b');

    const otherCategoryId = await createUserCategory(token1, '유저1카테고리');

    const res = await request(app)
      .post(TODOS)
      .set(authHeader(token2))
      .send({ title: '탈취시도', categoryId: otherCategoryId, startDate: '2026-05-13', dueDate: '2026-05-14' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/todos', () => {
  it('본인 할일 목록 반환', async () => {
    const token = await registerAndLogin();
    const categoryId = await getDefaultCategoryId(token);

    await request(app).post(TODOS).set(authHeader(token))
      .send({ title: '할일A', categoryId, startDate: '2026-05-13', dueDate: '2026-05-14' });
    await request(app).post(TODOS).set(authHeader(token))
      .send({ title: '할일B', categoryId, startDate: '2026-05-13', dueDate: '2026-05-15' });

    const res = await request(app).get(TODOS).set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('다른 사용자의 할일은 조회되지 않음', async () => {
    const token1 = await registerAndLogin('_c');
    const token2 = await registerAndLogin('_d');
    const cat1 = await getDefaultCategoryId(token1);

    await request(app).post(TODOS).set(authHeader(token1))
      .send({ title: '유저1할일', categoryId: cat1, startDate: '2026-05-13', dueDate: '2026-05-14' });

    const res = await request(app).get(TODOS).set(authHeader(token2));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});

describe('PATCH /api/todos/:id', () => {
  it('정상 수정 시 200 반환', async () => {
    const token = await registerAndLogin();
    const categoryId = await getDefaultCategoryId(token);

    const create = await request(app).post(TODOS).set(authHeader(token))
      .send({ title: '수정전', categoryId, startDate: '2026-05-13', dueDate: '2026-05-14' });
    const id = create.body.data.id;

    const res = await request(app).patch(`${TODOS}/${id}`).set(authHeader(token))
      .send({ title: '수정후' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('수정후');
  });

  it('완료 토글 (isCompleted true → false)', async () => {
    const token = await registerAndLogin();
    const categoryId = await getDefaultCategoryId(token);

    const create = await request(app).post(TODOS).set(authHeader(token))
      .send({ title: '토글테스트', categoryId, startDate: '2026-05-13', dueDate: '2026-05-14' });
    const id = create.body.data.id;

    const toggle = await request(app).patch(`${TODOS}/${id}`).set(authHeader(token))
      .send({ isCompleted: true });
    expect(toggle.body.data.isCompleted).toBe(true);

    const revert = await request(app).patch(`${TODOS}/${id}`).set(authHeader(token))
      .send({ isCompleted: false });
    expect(revert.body.data.isCompleted).toBe(false);
  });

  it('타인의 Todo 수정 시도 시 403 FORBIDDEN', async () => {
    const token1 = await registerAndLogin('_e');
    const token2 = await registerAndLogin('_f');
    const cat1 = await getDefaultCategoryId(token1);

    const create = await request(app).post(TODOS).set(authHeader(token1))
      .send({ title: '유저1할일', categoryId: cat1, startDate: '2026-05-13', dueDate: '2026-05-14' });
    const id = create.body.data.id;

    const res = await request(app).patch(`${TODOS}/${id}`).set(authHeader(token2))
      .send({ title: '탈취' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('dueDate < startDate 수정 시 400 VALIDATION_ERROR', async () => {
    const token = await registerAndLogin();
    const categoryId = await getDefaultCategoryId(token);

    const create = await request(app).post(TODOS).set(authHeader(token))
      .send({ title: '날짜테스트', categoryId, startDate: '2026-05-13', dueDate: '2026-05-14' });
    const id = create.body.data.id;

    const res = await request(app).patch(`${TODOS}/${id}`).set(authHeader(token))
      .send({ dueDate: '2026-05-12' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('DELETE /api/todos/:id', () => {
  it('정상 삭제 시 204 반환', async () => {
    const token = await registerAndLogin();
    const categoryId = await getDefaultCategoryId(token);

    const create = await request(app).post(TODOS).set(authHeader(token))
      .send({ title: '삭제용', categoryId, startDate: '2026-05-13', dueDate: '2026-05-14' });
    const id = create.body.data.id;

    const res = await request(app).delete(`${TODOS}/${id}`).set(authHeader(token));
    expect(res.status).toBe(204);
  });

  it('타인의 Todo 삭제 시도 시 403 FORBIDDEN', async () => {
    const token1 = await registerAndLogin('_g');
    const token2 = await registerAndLogin('_h');
    const cat1 = await getDefaultCategoryId(token1);

    const create = await request(app).post(TODOS).set(authHeader(token1))
      .send({ title: '유저1할일', categoryId: cat1, startDate: '2026-05-13', dueDate: '2026-05-14' });
    const id = create.body.data.id;

    const res = await request(app).delete(`${TODOS}/${id}`).set(authHeader(token2));
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
