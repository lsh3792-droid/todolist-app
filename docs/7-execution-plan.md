# TodolistApp 실행 계획 (Execution Plan)

**버전:** 1.0  
**작성일:** 2026-05-13  
**참조 문서:** [PRD v1.2](./2-prd.md) · [아키텍처 원칙 v1.0](./4-architecture-principles.md) · [ERD v1.0](./6-erd.md)

---

## 개요

### Task 명명 규칙

| 접두사  | 영역         |
| ------- | ------------ |
| `DB-xx` | 데이터베이스 |
| `BE-xx` | 백엔드       |
| `FE-xx` | 프론트엔드   |

### 의존성 표기

```
→ : 선행 Task가 완료되어야 시작 가능
∥ : 병렬 수행 가능 (선행 Task 불필요)
```

### 전체 수행 순서 요약

```
[DB 단계]
  DB-01 → DB-02 → DB-03

[BE 단계] (DB-01 이후 시작)
  DB-01 → BE-01
           BE-01 → BE-02, BE-03 (병렬)
                    BE-02, BE-03 완료 → BE-04
                                         BE-04 → BE-05, BE-06, BE-07 (병렬)
                                                  BE-06 완료 → BE-08, BE-09 (병렬)
                                                  BE-05~09 완료 → BE-10 → BE-11

[FE 단계] (BE-11 이전에도 FE-01~FE-06 선행 가능)
  FE-01 → FE-02, FE-03 (병렬)
            FE-02, FE-03 완료 → FE-04 → FE-05
                                           FE-05 → FE-06, FE-07, FE-08 (병렬)
                                                    FE-06, FE-07 완료 → FE-09
                                                    FE-08, FE-09 완료 → FE-10, FE-11 (병렬)
                                                    FE-10, FE-11 완료 → FE-12 → FE-13
```

---

## 데이터베이스 (DB)

---

### DB-01 · 스키마 DDL 작성 및 검증

**설명:** `database/schema.sql` — 전체 테이블 DDL, 인덱스, 트리거, 시드 데이터  
**의존성:** ∥ 없음 (선행 Task 없음)  
**참조:** [ERD](./6-erd.md)

> `database/schema.sql` 파일은 이미 작성 완료되었음

#### 완료 조건

- [O] `users` 테이블 생성 (`id UUID PK`, `email UNIQUE`, `password`, `name`, `created_at`, `updated_at`)
- [O] `categories` 테이블 생성 (`id UUID PK`, `user_id UUID nullable FK`, `name`, `is_default`, `created_at`)
- [O] `todos` 테이블 생성 (`id UUID PK`, `user_id FK NOT NULL`, `category_id FK NOT NULL`, `title`, `description nullable`, `start_date`, `due_date`, `is_completed`, `created_at`, `updated_at`)
- [O] `categories.user_id IS NOT NULL` 구간 부분 유니크 인덱스 (`uq_categories_user_name`)
- [O] `categories.user_id IS NULL` 구간 부분 유니크 인덱스 (`uq_categories_default_name`)
- [O] `fn_set_updated_at()` 트리거 함수 및 `users`, `todos` 테이블 트리거 등록
- [O] `todos(user_id)`, `todos(category_id)`, `todos(user_id, is_completed)`, `todos(user_id, due_date)`, `categories(user_id)` 성능 인덱스
- [O] `CHECK (due_date >= start_date)` 제약 조건
- [O] `FK categories → users ON DELETE CASCADE`
- [O] `FK todos → users ON DELETE CASCADE`
- [O] `FK todos → categories ON DELETE RESTRICT`
- [O] 기본 카테고리 시드 INSERT (`업무`, `개인`, `기타`, `is_default=TRUE`, `user_id=NULL`)
- [O] `psql` 또는 DB 클라이언트로 실제 실행 후 오류 없이 완료됨을 확인

---

### DB-02 · 마이그레이션 파일 분리

**설명:** `backend/src/db/migrations/` — 단일 `schema.sql`을 번호 순서의 마이그레이션 파일로 분리  
**의존성:** → DB-01

#### 완료 조건

- [O] `001-create-users-table.sql` 파일 생성 (`users` 테이블 + `updated_at` 트리거)
- [O] `002-create-categories-table.sql` 파일 생성 (`categories` 테이블 + 부분 유니크 인덱스)
- [O] `003-create-todos-table.sql` 파일 생성 (`todos` 테이블 + 인덱스 + CHECK)
- [O] 각 파일이 독립 실행 가능 (번호 순서대로 실행 시 동일한 스키마 생성)
- [O] `backend/src/db/migrations/` 경로에 위치

---

### DB-03 · 시드 스크립트 구현

**설명:** `backend/src/db/seeds/defaultCategories.js` — 서버 기동 시 기본 카테고리 존재 여부 확인 후 INSERT  
**의존성:** → DB-01

#### 완료 조건

- [O] `defaultCategories.js` 파일에 시드 함수 구현
- [O] `pg Pool`을 사용하여 `ON CONFLICT DO NOTHING` 방식으로 INSERT
- [O] 시드 데이터: `업무`, `개인`, `기타` (모두 `is_default=TRUE`, `user_id=NULL`)
- [O] 시드 함수가 `server.js` 또는 별도 시드 스크립트에서 호출됨
- [O] 중복 실행 시 오류 없음 확인

---

## 백엔드 (BE)

---

### BE-01 · 백엔드 프로젝트 초기 설정

**설명:** `backend/` — Node.js + Express 프로젝트 뼈대, 린트/포맷 설정  
**의존성:** ∥ 없음

#### 완료 조건

- [O] `backend/package.json` 생성 (`express`, `pg`, `jsonwebtoken`, `bcrypt`, `cors`, `morgan`, `dotenv` 의존성 포함)
- [O] 개발 의존성 추가 (`jest`, `supertest`, `eslint`, `prettier`, `husky`, `lint-staged`)
- [O] `.eslintrc.js` 생성 (`eslint:recommended` 기반, `no-console: warn`, `no-unused-vars: error`)
- [O] `.prettierrc` 생성 (스페이스 2칸, 세미콜론 필수, 작은따옴표)
- [O] `jest.config.js` 생성
- [O] `husky` + `lint-staged` 설정 (commit 전 ESLint + Prettier 자동 실행)
- [O] `.env.example` 생성 (`DATABASE_URL`, `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN=1h`, `JWT_REFRESH_EXPIRES_IN=7d`, `CORS_ALLOWED_ORIGIN`, `BCRYPT_SALT_ROUNDS=10`, `PORT=3000`, `NODE_ENV` 포함)
- [O] `.gitignore` 생성 (`.env`, `node_modules/` 포함)
- [O] `npm install` 정상 완료

---

### BE-02 · 환경변수 검증 및 설정 모듈

**설명:** `config/validateEnv.js`, `config/corsOptions.js` 구현  
**의존성:** → BE-01

#### 완료 조건

- [O] `config/validateEnv.js` 구현 — `DATABASE_URL`, `JWT_SECRET`, `CORS_ALLOWED_ORIGIN` 누락 시 `process.exit(1)` 처리
- [O] `config/corsOptions.js` 구현 — `process.env.CORS_ALLOWED_ORIGIN` 기반, `credentials` 미설정, 허용 메서드: `GET, POST, PATCH, DELETE, OPTIONS`, 허용 헤더: `Content-Type, Authorization`
- [O] 서버 기동 시 `validateEnv.js`가 가장 먼저 실행됨 (`server.js` 최상단 `require`)
- [O] 필수 환경변수 누락 시 명확한 오류 메시지와 함께 프로세스 종료 확인

---

### BE-03 · DB Pool 설정

**설명:** `db/pool.js` — pg Pool 인스턴스 생성  
**의존성:** → BE-01

#### 완료 조건

- [O] `db/pool.js` 구현 — `process.env.DATABASE_URL` 기반 `pg.Pool` 생성 및 내보내기
- [O] Pool 연결 테스트 (`pool.query('SELECT 1')`) 성공 확인
- [O] DB 연결 실패 시 에러 로깅 후 서버 기동 중단

---

### BE-04 · 공통 유틸리티 구현

**설명:** `utils/AppError.js`, `utils/asyncHandler.js`, `utils/tokenHelper.js`  
**의존성:** → BE-02, BE-03

#### 완료 조건

- [O] `utils/AppError.js` 구현 — `statusCode`, `code`, `message` 속성을 가진 커스텀 에러 클래스
- [O] `utils/asyncHandler.js` 구현 — 비동기 Controller 함수를 `try/catch → next(err)` 로 래핑
- [O] `utils/tokenHelper.js` 구현
  - [O] `signAccessToken(payload)` — `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN` 사용
  - [O] `signRefreshToken(payload)` — `JWT_SECRET`, `JWT_REFRESH_EXPIRES_IN` 사용
  - [O] `verifyToken(token)` — 검증 실패 시 `AppError(401, 'UNAUTHORIZED', ...)` throw

---

### BE-05 · 미들웨어 구현

**설명:** `middlewares/authenticate.js`, `middlewares/errorHandler.js`  
**의존성:** → BE-04

#### 완료 조건

- [O] `middlewares/authenticate.js` 구현
  - [O] `Authorization: Bearer <token>` 헤더 파싱
  - [O] `verifyToken()` 호출 → 유효하면 `req.user = { id, email }` 세팅
  - [O] 토큰 없거나 만료 시 `AppError(401, 'UNAUTHORIZED', ...)` throw
- [O] `middlewares/errorHandler.js` 구현
  - [O] `AppError` 인스턴스 → `{ error: { code, message } }` 응답
  - [O] 예상치 못한 에러 → `500 INTERNAL_ERROR` 응답 (스택 트레이스 미노출)
  - [O] `app.js`의 마지막 미들웨어로 등록됨

---

### BE-06 · Auth 도메인 구현

**설명:** 회원가입, 로그인, Access Token 재발급 API  
**의존성:** → BE-04, BE-05

#### 완료 조건

**Repository (`repositories/userRepository.js`)**

- [O] `findByEmail(email)` — 이메일로 사용자 조회 (비밀번호 포함)
- [O] `findById(id)` — ID로 사용자 조회 (비밀번호 제외)
- [O] `create({ email, password, name })` — 사용자 생성
- [O] `update(id, { name?, password? })` — 사용자 정보 수정
- [O] `remove(id)` — 사용자 삭제 (CASCADE로 Todo, Category 연쇄 삭제)
- [O] 모든 쿼리 파라미터화 (`$1`, `$2`, ...)

**Service (`services/authService.js`)**

- [O] `register({ email, password, name })` — 이메일 중복 검사(409), bcrypt 해시, 사용자 생성, Access/Refresh Token 발급
- [O] `login({ email, password })` — 이메일 조회(401), bcrypt 비교(401), Access/Refresh Token 발급
- [O] `refresh({ refreshToken })` — Refresh Token 검증, 새 Access Token 발급

**Controller (`controllers/authController.js`)**

- [O] `register` — `POST /api/auth/register` → 201 + `{ data: { accessToken, refreshToken } }`
- [O] `login` — `POST /api/auth/login` → 200 + `{ data: { accessToken, refreshToken } }`
- [O] `refresh` — `POST /api/auth/refresh` → 200 + `{ data: { accessToken } }`
- [O] 입력값 검증: 이메일 형식, 비밀번호 최소 8자, 이름 필수

**Router (`routes/authRoutes.js`)**

- [O] `POST /api/auth/register` → `authController.register`
- [O] `POST /api/auth/login` → `authController.login`
- [O] `POST /api/auth/refresh` → `authController.refresh`

---

### BE-07 · User 도메인 구현

**설명:** 내 정보 조회·수정, 회원 탈퇴 API  
**의존성:** → BE-05, BE-06 (userRepository 재사용)

#### 완료 조건

**Service (`services/userService.js`)**

- [O] `getMe(userId)` — 사용자 정보 조회 (비밀번호 미포함)
- [O] `updateMe(userId, { name?, currentPassword?, newPassword? })` — 이름 또는 비밀번호 수정 (비밀번호 변경 시 현재 비밀번호 검증)
- [O] `deleteMe(userId)` — 계정 삭제 (Todo, 사용자 정의 Category CASCADE 삭제, 기본 카테고리 유지)

**Controller (`controllers/userController.js`)**

- [O] `getMe` — `GET /api/users/me` → 200 + `{ data: { id, email, name, createdAt } }`
- [O] `updateMe` — `PATCH /api/users/me` → 200 + `{ data: { id, email, name } }`
- [O] `deleteMe` — `DELETE /api/users/me` → 204 No Content

**Router (`routes/userRoutes.js`)**

- [O] 모든 라우트에 `authenticate` 미들웨어 적용
- [O] `GET /api/users/me` → `userController.getMe`
- [O] `PATCH /api/users/me` → `userController.updateMe`
- [O] `DELETE /api/users/me` → `userController.deleteMe`

---

### BE-08 · Category 도메인 구현

**설명:** 카테고리 목록 조회, 추가, 수정, 삭제 API  
**의존성:** → BE-05, BE-06

#### 완료 조건

**Repository (`repositories/categoryRepository.js`)**

- [O] `findAllByUser(userId)` — 기본 카테고리(`user_id IS NULL`) + 해당 사용자 카테고리 조회
- [O] `findById(id)` — 카테고리 단건 조회
- [O] `create({ userId, name })` — 사용자 정의 카테고리 생성
- [O] `update(id, { name })` — 카테고리명 수정
- [O] `remove(id)` — 카테고리 삭제

**Service (`services/categoryService.js`)**

- [O] `getCategories(userId)` — 카테고리 목록 반환
- [O] `createCategory(userId, { name })` — 중복명 검사(409), 생성
- [O] `updateCategory(userId, categoryId, { name })` — 존재 여부(404), 소유권(403), 기본 카테고리 보호(403), 중복명(409), 수정
- [O] `deleteCategory(userId, categoryId)` — 존재 여부(404), 소유권(403), 기본 카테고리 보호(403), 연결 할일 존재 시 삭제 불가(409), 삭제

**Controller (`controllers/categoryController.js`)**

- [O] `getCategories` — `GET /api/categories` → 200 + `{ data: [...] }`
- [O] `createCategory` — `POST /api/categories` → 201 + `{ data: { id, name, isDefault } }`
- [O] `updateCategory` — `PATCH /api/categories/:id` → 200 + `{ data: { id, name } }`
- [O] `deleteCategory` — `DELETE /api/categories/:id` → 204 No Content

**Router (`routes/categoryRoutes.js`)**

- [O] 모든 라우트에 `authenticate` 미들웨어 적용
- [O] `GET /api/categories` → `categoryController.getCategories`
- [O] `POST /api/categories` → `categoryController.createCategory`
- [O] `PATCH /api/categories/:id` → `categoryController.updateCategory`
- [O] `DELETE /api/categories/:id` → `categoryController.deleteCategory`

---

### BE-09 · Todo 도메인 구현

**설명:** 할일 목록 조회(필터), 등록, 단건 조회, 수정/완료 토글, 삭제 API  
**의존성:** → BE-05, BE-06, BE-08 (categoryRepository 소유권 검증에서 사용)

#### 완료 조건

**Repository (`repositories/todoRepository.js`)**

- [O] `findAllByUserId(userId, filters)` — `categoryId`, `isCompleted`, `dueDateFrom`, `dueDateTo` AND 조합 동적 필터 (파라미터 배열 동적 구성)
- [O] `findById(id)` — 할일 단건 조회
- [O] `create({ userId, categoryId, title, description, startDate, dueDate })` — 할일 생성
- [O] `update(id, fields)` — 부분 업데이트 (변경된 필드만 SET)
- [O] `remove(id)` — 할일 삭제
- [O] 모든 쿼리 파라미터화 (SQL 인젝션 방어)

**Service (`services/todoService.js`)**

- [O] `getTodos(userId, filters)` — 목록 반환
- [O] `createTodo(userId, { categoryId, title, description, startDate, dueDate })` — `categoryId` 존재·소유권 검증(404), `dueDate >= startDate` 검증(400), 생성
- [O] `getTodoById(userId, todoId)` — 존재 여부(404), 소유권(403), 반환
- [O] `updateTodo(userId, todoId, fields)` — 존재 여부(404), 소유권(403), `dueDate >= startDate` 검증(400), 수정 (UC-07 완료 토글 포함)
- [O] `deleteTodo(userId, todoId)` — 존재 여부(404), 소유권(403), 삭제

**Controller (`controllers/todoController.js`)**

- [O] `getTodos` — `GET /api/todos` → 200 + `{ data: [...] }`
- [O] `createTodo` — `POST /api/todos` → 201 + `{ data: { id, title, ... } }`
- [O] `getTodoById` — `GET /api/todos/:id` → 200 + `{ data: { id, title, ... } }`
- [O] `updateTodo` — `PATCH /api/todos/:id` → 200 + `{ data: { id, title, isCompleted, ... } }` (UC-05, UC-07 통합)
- [O] `deleteTodo` — `DELETE /api/todos/:id` → 204 No Content

**Router (`routes/todoRoutes.js`)**

- [O] 모든 라우트에 `authenticate` 미들웨어 적용
- [O] `GET /api/todos` → `todoController.getTodos`
- [O] `POST /api/todos` → `todoController.createTodo`
- [O] `GET /api/todos/:id` → `todoController.getTodoById`
- [O] `PATCH /api/todos/:id` → `todoController.updateTodo`
- [O] `DELETE /api/todos/:id` → `todoController.deleteTodo`

---

### BE-10 · 백엔드 테스트 작성

**설명:** 인증, 소유권, 비즈니스 규칙 핵심 케이스 통합 테스트  
**의존성:** → BE-06, BE-07, BE-08, BE-09

#### 완료 조건

**인증 흐름 (`tests/auth.test.js`)**

- [O] 유효하지 않은 토큰으로 보호 엔드포인트 접근 → `401 UNAUTHORIZED`
- [O] 만료된 Access Token + 유효한 Refresh Token → 새 Access Token 발급
- [O] 만료된 Refresh Token으로 갱신 시도 → `401 UNAUTHORIZED`
- [O] 비밀번호 불일치 로그인 → `401` (이메일 존재 여부 노출 금지)
- [O] 중복 이메일 회원가입 → `409 CONFLICT`

**소유권 검증 (`tests/todo.test.js`, `tests/category.test.js`)**

- [O] 타인의 Todo 수정/삭제 시도 → `403 FORBIDDEN`
- [O] 타인의 Category 수정/삭제 시도 → `403 FORBIDDEN`
- [O] 타인의 `categoryId`로 Todo 등록 시도 → `404 NOT_FOUND`

**비즈니스 규칙 핵심 (`tests/todo.test.js`, `tests/category.test.js`)**

- [O] `dueDate < startDate` 인 Todo 등록 → `400 VALIDATION_ERROR`
- [O] 할일이 연결된 Category 삭제 시도 → `409 CONFLICT`
- [O] `isDefault=true` Category 삭제 시도 → `403 FORBIDDEN`
- [O] `isDefault=true` Category 수정 시도 → `403 FORBIDDEN`
- [O] 동일 사용자 내 중복 Category명 생성 → `409 CONFLICT`
- [O] 모든 테스트 `npm test` 실행 시 PASS

---

### BE-11 · Express 앱 통합 및 서버 기동 검증

**설명:** `app.js`, `server.js` 작성 및 전체 라우트 통합  
**의존성:** → BE-05, BE-06, BE-07, BE-08, BE-09

#### 완료 조건

- [O] `app.js` 구현
  - [O] `validateEnv` 최상단 실행
  - [O] `morgan` HTTP 요청 로깅 설정
  - [O] CORS 설정 (`corsOptions.js` 적용)
  - [O] `express.json()` 미들웨어 등록
  - [O] Swagger UI 마운트 (`GET /api-docs` → `swagger/swagger.json` 기반 swagger-ui-express 적용)
  - [O] 라우트 통합 (`/api/auth`, `/api/users`, `/api/todos`, `/api/categories`)
  - [O] 글로벌 에러 핸들러 마지막 등록
- [O] `server.js` 구현 — `app.listen(PORT)`, DB 연결 확인, 시드 실행
- [O] `routes/index.js` 구현 — 모든 라우트 통합 등록
- [O] 서버 `npm start` 정상 기동 확인
- [O] `GET /api/categories` (기본 카테고리 3종 반환) 응답 확인 — Postman 또는 curl

---

## 프론트엔드 (FE)

---

### FE-01 · 프론트엔드 프로젝트 초기 설정

**설명:** Vite + React 19 + TypeScript 프로젝트 생성 및 의존성 설치  
**의존성:** ∥ 없음 (BE와 병렬 수행 가능)

#### 완료 조건

- [O] `npm create vite@latest frontend -- --template react-ts` 실행
- [O] 의존성 설치: `react-router-dom`, `zustand`, `@tanstack/react-query`, `axios` (또는 fetch 기반 client)
- [O] 개발 의존성 설치: `vitest`, `@testing-library/react`, `eslint`, `prettier`, `@typescript-eslint/eslint-plugin`
- [O] `tsconfig.json` `"strict": true` 확인
- [O] `.eslintrc.js` 생성 (`eslint:recommended` + `@typescript-eslint/recommended` + `react-hooks/recommended`)
- [O] `.prettierrc` 생성 (스페이스 2칸, 세미콜론 필수, 작은따옴표)
- [O] `.env.development` (`VITE_API_BASE_URL=http://localhost:3000`) 생성
- [O] `.env.example` 생성
- [O] `npm run dev` 정상 기동 확인

---

### FE-02 · TypeScript 타입 정의

**설명:** `src/types/` — 도메인 타입, API 응답 타입 정의  
**의존성:** → FE-01

#### 완료 조건

- [O] `src/types/auth.types.ts` 생성
  - [O] `User`, `LoginRequest`, `RegisterRequest`, `TokenResponse`, `RefreshResponse`
- [O] `src/types/todo.types.ts` 생성
  - [O] `Todo`, `CreateTodoRequest`, `UpdateTodoRequest`, `TodoFilters`
- [O] `src/types/category.types.ts` 생성
  - [O] `Category`, `CreateCategoryRequest`, `UpdateCategoryRequest`
- [O] `src/types/api.types.ts` 생성
  - [O] `ApiResponse<T>`, `ApiError`, `ErrorCode` (VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | INTERNAL_ERROR)
- [O] `any` 타입 미사용 확인 (ESLint `@typescript-eslint/no-explicit-any` 위반 없음)

---

### FE-03 · Zustand 스토어 구현

**설명:** `src/stores/authStore.ts`, `src/stores/uiStore.ts`  
**의존성:** → FE-01, FE-02

#### 완료 조건

- [O] `src/stores/authStore.ts` 구현
  - [O] `accessToken: string | null`
  - [O] `refreshToken: string | null`
  - [O] `currentUser: { id: string; name: string; email: string } | null`
  - [O] `setAuth(accessToken, refreshToken, user)` — 로그인 성공 시 저장
  - [O] `setAccessToken(accessToken)` — 토큰 재발급 시 Access Token만 갱신
  - [O] `clearAuth()` — 로그아웃 시 모든 상태 초기화
- [O] `src/stores/uiStore.ts` 구현
  - [O] 토스트 메시지 상태 (`toasts: Toast[]`)
  - [O] `addToast(message, type)`, `removeToast(id)` 액션
- [O] localStorage/sessionStorage/Cookie에 토큰을 저장하지 않음 확인

---

### FE-04 · API 클라이언트 구현 (인터셉터 포함)

**설명:** `src/api/client.ts` — axios 인스턴스, 401 자동 토큰 갱신 인터셉터  
**의존성:** → FE-02, FE-03

#### 완료 조건

- [O] `src/api/client.ts` 구현
  - [O] `VITE_API_BASE_URL` 기반 axios 인스턴스 생성
  - [O] 요청 인터셉터: `authStore`에서 `accessToken` 읽어 `Authorization: Bearer <token>` 헤더 자동 삽입
  - [O] 응답 인터셉터: 401 에러 감지 → `authStore`에서 `refreshToken` 읽어 `POST /api/auth/refresh` 호출 → 성공 시 `setAccessToken()` 후 원본 요청 재시도
  - [O] Refresh Token도 만료된 경우 (`refresh` 요청도 401) → `clearAuth()` 호출 후 로그인 페이지로 리다이렉트
  - [O] 요청/응답 인터셉터 내 토큰 값 로깅 금지

---

### FE-05 · API 함수 레이어 구현

**설명:** `src/api/` — 각 도메인별 HTTP 요청 함수  
**의존성:** → FE-04

#### 완료 조건

- [O] `src/api/authApi.ts` 구현
  - [O] `register(data: RegisterRequest)` → `POST /api/auth/register`
  - [O] `login(data: LoginRequest)` → `POST /api/auth/login`
  - [O] `refresh(refreshToken: string)` → `POST /api/auth/refresh` (body: `{ refreshToken }`)
- [O] `src/api/userApi.ts` 구현
  - [O] `getMe()` → `GET /api/users/me`
  - [O] `updateMe(data)` → `PATCH /api/users/me`
  - [O] `deleteMe()` → `DELETE /api/users/me`
- [O] `src/api/todoApi.ts` 구현
  - [O] `getAll(filters: TodoFilters)` → `GET /api/todos?[querystring]`
  - [O] `getById(id: string)` → `GET /api/todos/:id`
  - [O] `create(data: CreateTodoRequest)` → `POST /api/todos`
  - [O] `update(id: string, data: UpdateTodoRequest)` → `PATCH /api/todos/:id`
  - [O] `remove(id: string)` → `DELETE /api/todos/:id`
- [O] `src/api/categoryApi.ts` 구현
  - [O] `getAll()` → `GET /api/categories`
  - [O] `create(data: CreateCategoryRequest)` → `POST /api/categories`
  - [O] `update(id: string, data: UpdateCategoryRequest)` → `PATCH /api/categories/:id`
  - [O] `remove(id: string)` → `DELETE /api/categories/:id`
- [O] 모든 함수의 반환 타입 명시 (`ApiResponse<T>`)

---

### FE-06 · 인증 커스텀 훅 구현

**설명:** `src/hooks/auth/` — 로그인, 회원가입, 로그아웃 useMutation 훅  
**의존성:** → FE-05

#### 완료 조건

- [O] `src/hooks/auth/useLogin.ts` 구현
  - [O] `useMutation` → `authApi.login` 호출
  - [O] 성공 시 `authStore.setAuth()` 호출 (Access Token, Refresh Token, 사용자 정보 저장)
  - [O] 성공 시 Todo 목록 페이지로 리다이렉트
- [O] `src/hooks/auth/useRegister.ts` 구현
  - [O] `useMutation` → `authApi.register` 호출
  - [O] 성공 시 `authStore.setAuth()` 호출
  - [O] 성공 시 Todo 목록 페이지로 리다이렉트
- [O] `src/hooks/auth/useLogout.ts` 구현
  - [O] `authStore.clearAuth()` 호출 (서버 요청 없음)
  - [O] TanStack Query 캐시 전체 초기화 (`queryClient.clear()`)
  - [O] 로그인 페이지로 리다이렉트

---

### FE-07 · 인증 화면 구현

**설명:** `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx` 및 폼 컴포넌트  
**의존성:** → FE-06

#### 완료 조건

- [O] `src/features/auth/LoginForm.tsx` 구현
  - [O] 이메일, 비밀번호 입력 필드
  - [O] 클라이언트 유효성 검증 인라인 에러 표시 (이메일 형식, 비밀번호 최소 8자)
  - [O] 로그인 중 버튼 비활성화 + 스피너
  - [O] API 에러 (401) 토스트 또는 인라인 표시
- [O] `src/features/auth/RegisterForm.tsx` 구현
  - [O] 이메일, 비밀번호, 이름 입력 필드
  - [O] 클라이언트 유효성 검증 인라인 에러 표시
  - [O] API 에러 (409 이메일 중복) 인라인 표시
- [O] `src/pages/LoginPage.tsx` 구현 (LoginForm 조합, 회원가입 링크 포함)
- [O] `src/pages/RegisterPage.tsx` 구현 (RegisterForm 조합, 로그인 링크 포함)
- [O] 인증된 사용자가 로그인 페이지 접근 시 Todo 목록으로 리다이렉트
- [O] 반응형 레이아웃 (320px ~ 1920px) 확인

---

### FE-08 · Todo·Category 커스텀 훅 구현

**설명:** `src/hooks/todo/`, `src/hooks/category/` — TanStack Query 기반 훅  
**의존성:** → FE-05

#### 완료 조건

**Todo 훅**

- [O] `src/hooks/todo/useTodos.ts` — `useQuery(['todos', filters])` → `todoApi.getAll(filters)`
- [O] `src/hooks/todo/useCreateTodo.ts` — `useMutation` → 성공 시 `['todos']` 캐시 무효화
- [O] `src/hooks/todo/useUpdateTodo.ts` — `useMutation` → 성공 시 `['todos']` 캐시 무효화 (UC-07 완료 토글 포함)
- [O] `src/hooks/todo/useDeleteTodo.ts` — `useMutation` → 성공 시 `['todos']` 캐시 무효화

**Category 훅**

- [O] `src/hooks/category/useCategories.ts` — `useQuery(['categories'])` → `categoryApi.getAll()`
- [O] `src/hooks/category/useCreateCategory.ts` — `useMutation` → 성공 시 `['categories']` 캐시 무효화
- [O] `src/hooks/category/useUpdateCategory.ts` — `useMutation` → 성공 시 `['categories']` 캐시 무효화
- [O] `src/hooks/category/useDeleteCategory.ts` — `useMutation` → 성공 시 `['categories']`, `['todos']` 캐시 무효화

---

### FE-09 · 공통 UI 컴포넌트 구현

**설명:** `src/components/` — 도메인 무관 재사용 UI 컴포넌트  
**의존성:** → FE-01

#### 완료 조건

- [O] `src/components/Button.tsx` — variant (primary, secondary, danger), disabled, loading 상태 지원
- [O] `src/components/Input.tsx` — label, error 메시지, placeholder 지원
- [O] `src/components/Modal.tsx` — 오버레이, 닫기(ESC 키 + 배경 클릭), title, children 슬롯
- [O] `src/components/Toast.tsx` + `src/components/ToastContainer.tsx` — success/error/info 타입, 자동 닫힘
- [O] `src/components/ConfirmDialog.tsx` — 삭제 확인 다이얼로그 (메시지, 확인/취소 버튼)
- [O] `src/components/Spinner.tsx` — 로딩 스피너
- [O] 모든 컴포넌트 TypeScript props 타입 명시
- [O] `any` 타입 미사용

---

### FE-10 · 할일 기능 화면 구현

**설명:** 할일 목록(필터), 등록, 수정, 삭제, 완료 토글 화면  
**의존성:** → FE-08, FE-09

#### 완료 조건

- [O] `src/features/todo/TodoFilterBar.tsx` 구현
  - [O] 카테고리 드롭다운 (`useCategories` 데이터 활용)
  - [O] 완료 여부 토글 (전체/완료/미완료)
  - [O] 시작일(`dueDateFrom`) ~ 종료일(`dueDateTo`) 날짜 입력
  - [O] 필터 변경 시 `useTodos` queryKey 업데이트 → 자동 재조회
- [O] `src/features/todo/TodoCard.tsx` 구현
  - [O] 제목, 카테고리, 시작일·종료예정일, 완료 여부 표시
  - [O] 완료 체크박스 토글 → `useUpdateTodo` 호출 (UC-07)
  - [O] 수정, 삭제 버튼
- [O] `src/features/todo/TodoForm.tsx` 구현
  - [O] 제목, 설명, 카테고리 선택, 시작일, 종료예정일 입력
  - [O] 클라이언트 검증: 제목 필수, `dueDate >= startDate`
- [O] `src/features/todo/TodoModal.tsx` 구현 (TodoForm을 Modal로 감쌈, 등록/수정 모드 구분)
- [O] `src/features/todo/TodoList.tsx` 구현 (로딩 스켈레톤, 빈 목록 메시지 포함)
- [O] `src/pages/TodoListPage.tsx` 구현 (FilterBar + TodoList + TodoModal 조합)
- [O] 반응형 레이아웃 확인 (320px ~ 1920px)
- [O] 삭제 시 `ConfirmDialog` 표시

---

### FE-11 · 카테고리 관리 화면 구현

**설명:** 카테고리 목록 조회, 추가, 수정, 삭제 화면  
**의존성:** → FE-08, FE-09

#### 완료 조건

- [O] `src/features/category/CategoryItem.tsx` 구현
  - [O] 카테고리명 표시
  - [O] 기본 카테고리(`isDefault=true`): 수정/삭제 버튼 비활성화
  - [O] 사용자 정의 카테고리: 수정(인라인 편집), 삭제 버튼 활성화
- [O] `src/features/category/CategoryForm.tsx` 구현 (카테고리명 입력, 추가/수정 인라인 폼)
- [O] `src/features/category/CategoryList.tsx` 구현 (기본 카테고리 + 사용자 정의 카테고리 목록)
- [O] `src/pages/CategoryPage.tsx` 구현
- [O] 삭제 시 `ConfirmDialog` 표시
- [O] API 에러 (409 연결 할일 존재, 403 기본 카테고리) 토스트 표시

---

### FE-12 · 사용자 설정 화면 구현

**설명:** 이름·비밀번호 수정, 회원 탈퇴 화면  
**의존성:** → FE-06, FE-08, FE-09

#### 완료 조건

- [O] `src/pages/SettingsPage.tsx` 구현
  - [O] 현재 사용자 정보 표시 (`useQuery(['me'])`)
  - [O] 이름 수정 폼 (현재 이름 pre-fill)
  - [O] 비밀번호 변경 폼 (현재 비밀번호 검증 + 새 비밀번호 + 확인)
  - [O] 회원 탈퇴 버튼 → `ConfirmDialog` → `userApi.deleteMe()` → `clearAuth()` → 로그인 페이지
- [O] 수정 성공 시 토스트 메시지 표시

---

### FE-13 · 라우팅 설정 및 인증 보호 라우트

**설명:** `src/App.tsx` — React Router 기반 라우팅, 비인증 사용자 접근 차단  
**의존성:** → FE-07, FE-10, FE-11, FE-12

#### 완료 조건

- [O] `src/App.tsx` 라우트 정의
  - [O] `/login` → `LoginPage`
  - [O] `/register` → `RegisterPage`
  - [O] `/todos` → `TodoListPage` (보호 라우트)
  - [O] `/categories` → `CategoryPage` (보호 라우트)
  - [O] `/settings` → `SettingsPage` (보호 라우트)
  - [O] `/` → `/todos` 리다이렉트
- [O] `PrivateRoute` 컴포넌트 구현 — `authStore.accessToken`이 없으면 `/login`으로 리다이렉트
- [O] `QueryClientProvider` + `RouterProvider` + Toast 컨테이너 최상위 등록
- [O] 비인증 상태에서 보호 라우트 접근 시 `/login` 리다이렉트 확인
- [O] 인증 상태에서 `/login`, `/register` 접근 시 `/todos` 리다이렉트 확인

---

## 부록: Task 의존성 체크리스트

### 데이터베이스 의존성

| Task  | 선행 Task | 병렬 가능      |
| ----- | --------- | -------------- |
| DB-01 | 없음      | ∥ BE-01, FE-01 |
| DB-02 | DB-01     | ∥ DB-03        |
| DB-03 | DB-01     | ∥ DB-02        |

### 백엔드 의존성

| Task  | 선행 Task                  | 병렬 가능      |
| ----- | -------------------------- | -------------- |
| BE-01 | 없음                       | ∥ FE-01, DB-01 |
| BE-02 | BE-01                      | ∥ BE-03        |
| BE-03 | BE-01                      | ∥ BE-02        |
| BE-04 | BE-02, BE-03               | —              |
| BE-05 | BE-04                      | ∥ BE-06, BE-07 |
| BE-06 | BE-04, BE-05               | ∥ BE-07        |
| BE-07 | BE-05, BE-06               | ∥ BE-08        |
| BE-08 | BE-05, BE-06               | ∥ BE-09        |
| BE-09 | BE-05, BE-06, BE-08        | —              |
| BE-10 | BE-06, BE-07, BE-08, BE-09 | —              |
| BE-11 | BE-05~BE-09                | —              |

### 프론트엔드 의존성

| Task  | 선행 Task                  | 병렬 가능      |
| ----- | -------------------------- | -------------- |
| FE-01 | 없음                       | ∥ BE-01, DB-01 |
| FE-02 | FE-01                      | ∥ FE-03        |
| FE-03 | FE-01, FE-02               | ∥ FE-02        |
| FE-04 | FE-02, FE-03               | —              |
| FE-05 | FE-04                      | —              |
| FE-06 | FE-05                      | ∥ FE-07, FE-08 |
| FE-07 | FE-06                      | ∥ FE-08        |
| FE-08 | FE-05                      | ∥ FE-06, FE-09 |
| FE-09 | FE-01                      | ∥ FE-08        |
| FE-10 | FE-08, FE-09               | ∥ FE-11        |
| FE-11 | FE-08, FE-09               | ∥ FE-10        |
| FE-12 | FE-06, FE-08, FE-09        | —              |
| FE-13 | FE-07, FE-10, FE-11, FE-12 | —              |
