# 프론트엔드 통합 가이드

**버전:** 1.0  
**작성일:** 2026-05-14  
**참조 문서:**
- API 명세서 (`swagger/swagger.json`)
- 아키텍처 다이어그램 (`5-arch-diagram.md`)
- 실행 계획 (`7-execution-plan.md`)

---

## 1. 기본 설정

### API Base URL

```
개발: http://localhost:3000
운영: https://api.yourdomain.com
```

`.env.development`에 정의합니다.

```env
VITE_API_BASE_URL=http://localhost:3000
```

### axios 인스턴스 생성

```ts
// src/api/client.ts
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});
```

---

## 2. 인증 방식

### 토큰 구조

| 토큰 | 만료 | 저장 위치 | 용도 |
|------|------|-----------|------|
| Access Token | 1시간 | Zustand 메모리 | API 요청 헤더 |
| Refresh Token | 7일 | Zustand 메모리 | Access Token 재발급 |

**중요:** 두 토큰 모두 Cookie, localStorage, sessionStorage에 저장하지 않습니다. Zustand 스토어(메모리)에만 보관합니다.

### 요청 헤더

인증이 필요한 모든 API 요청에 Access Token을 헤더로 전달합니다.

```
Authorization: Bearer <accessToken>
```

### Zustand authStore 구조

```ts
// src/stores/authStore.ts
interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: { id: string; name: string; email: string } | null;

  setAuth: (accessToken: string, refreshToken: string, user: AuthStore['currentUser']) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}
```

### 요청 인터셉터 — Access Token 자동 삽입

```ts
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 응답 인터셉터 — 401 자동 갱신

```ts
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
          { refreshToken }
        );
        useAuthStore.getState().setAccessToken(data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return client(originalRequest);
      } catch {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
```

**주의사항:**
- `_retry` 플래그로 무한 재시도를 방지합니다.
- `/api/auth/refresh` 요청 자체가 401이면 재로그인으로 이동합니다.
- 인터셉터 내부에서 토큰 값을 콘솔에 출력하지 않습니다.

---

## 3. 응답 형식

### 성공 응답

```json
{ "data": <리소스 또는 배열> }
```

| 상황 | 예시 |
|------|------|
| 단일 리소스 | `{ "data": { "id": "...", "title": "..." } }` |
| 목록 | `{ "data": [ ... ] }` |
| 빈 목록 | `{ "data": [] }` |
| 삭제 성공 | 응답 바디 없음 (HTTP 204) |

### 에러 응답

```json
{
  "error": {
    "code": "에러코드",
    "message": "한국어 메시지"
  }
}
```

### 에러 코드 목록

| code | HTTP | 발생 상황 | 프론트 처리 |
|------|------|-----------|-------------|
| `VALIDATION_ERROR` | 400 | 입력값 유효성 실패 | 인라인 에러 메시지 표시 |
| `UNAUTHORIZED` | 401 | 토큰 없음 또는 만료 | 인터셉터가 자동 재발급 시도 |
| `FORBIDDEN` | 403 | 소유권 없음, 기본 카테고리 수정/삭제 시도 | 토스트 에러 표시 |
| `NOT_FOUND` | 404 | 리소스 없음 | 토스트 에러 표시 |
| `CONFLICT` | 409 | 중복 데이터, 연결 할일 있는 카테고리 삭제 | 인라인 또는 토스트 에러 표시 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 | 토스트 에러 표시 |

---

## 4. API 엔드포인트 상세

### 4-1. 인증 (Auth)

#### 회원가입

```
POST /api/auth/register
```

**요청 바디:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동"
}
```

**유효성 규칙 (클라이언트에서도 검증):**
- `email`: RFC 5321 형식 필수
- `password`: 최소 8자
- `name`: 필수, 최대 50자

**성공 응답 (201):**

```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

성공 후: `authStore.setAuth(accessToken, refreshToken, user)` 호출 → `/todos` 리다이렉트

**에러:**
- `400 VALIDATION_ERROR` — 형식 오류
- `409 CONFLICT` — 이메일 중복 (인라인 표시)

---

#### 로그인

```
POST /api/auth/login
```

**요청 바디:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**성공 응답 (200):**

```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

성공 후: `authStore.setAuth(accessToken, refreshToken, user)` 호출 → `/todos` 리다이렉트

**에러:**
- `401 UNAUTHORIZED` — 이메일 미존재 또는 비밀번호 불일치 (보안상 동일 메시지)

---

#### Access Token 재발급

인터셉터가 자동으로 처리합니다. 직접 호출이 필요한 경우:

```
POST /api/auth/refresh
```

**요청 바디:**

```json
{ "refreshToken": "eyJ..." }
```

**성공 응답 (200):**

```json
{
  "data": { "accessToken": "eyJ..." }
}
```

---

#### 로그아웃

서버 요청 없습니다. 클라이언트 전용 처리입니다.

```ts
// src/hooks/auth/useLogout.ts
useAuthStore.getState().clearAuth();
queryClient.clear();
navigate('/login');
```

---

### 4-2. 사용자 (Users)

모든 엔드포인트에 `Authorization: Bearer <token>` 필요합니다.

#### 내 정보 조회

```
GET /api/users/me
```

**성공 응답 (200):**

```json
{
  "data": {
    "id": "550e8400-...",
    "email": "user@example.com",
    "name": "홍길동",
    "createdAt": "2026-05-13T09:00:00Z",
    "updatedAt": "2026-05-13T09:00:00Z"
  }
}
```

---

#### 내 정보 수정

```
PATCH /api/users/me
```

**요청 바디 (변경할 필드만 포함):**

```json
{ "name": "김민준" }
```

```json
{ "currentPassword": "password123", "newPassword": "newpass456" }
```

```json
{ "name": "김민준", "currentPassword": "password123", "newPassword": "newpass456" }
```

**유효성 규칙:**
- `name`: 최대 50자
- `newPassword`: 최소 8자
- 비밀번호 변경 시 `currentPassword` 필수

**성공 응답 (200):** 수정된 User 객체 반환

---

#### 회원 탈퇴

```
DELETE /api/users/me
```

**성공 응답:** 204 No Content (바디 없음)

성공 후: `authStore.clearAuth()` → `/login` 리다이렉트

삭제되는 데이터: 사용자 계정, 모든 할일, 사용자 정의 카테고리  
보존되는 데이터: 기본 카테고리 (업무, 개인, 기타)

---

### 4-3. 할일 (Todos)

모든 엔드포인트에 `Authorization: Bearer <token>` 필요합니다.

#### 할일 목록 조회 (필터링)

```
GET /api/todos
GET /api/todos?categoryId=<uuid>
GET /api/todos?isCompleted=false
GET /api/todos?dueDateFrom=2026-05-01&dueDateTo=2026-05-31
GET /api/todos?categoryId=<uuid>&isCompleted=false&dueDateFrom=2026-05-01
```

**쿼리 파라미터 (모두 선택):**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `categoryId` | UUID | 카테고리 필터 |
| `isCompleted` | boolean | 완료 여부 필터 |
| `dueDateFrom` | YYYY-MM-DD | 종료예정일 시작 범위 |
| `dueDateTo` | YYYY-MM-DD | 종료예정일 종료 범위 |

필터는 AND 조합입니다. 기간 필터 기준 필드는 `dueDate`입니다.

**성공 응답 (200):**

```json
{
  "data": [
    {
      "id": "660e8400-...",
      "userId": "550e8400-...",
      "categoryId": "770e8400-...",
      "title": "결제 모듈 버그 수정",
      "description": null,
      "startDate": "2026-05-13",
      "dueDate": "2026-05-13",
      "isCompleted": false,
      "createdAt": "2026-05-13T09:00:00Z",
      "updatedAt": "2026-05-13T09:00:00Z"
    }
  ]
}
```

결과 없음 시 `{ "data": [] }` 반환합니다.

---

#### 할일 단건 조회

```
GET /api/todos/:id
```

**에러:**
- `403 FORBIDDEN` — 타인 소유의 할일 접근
- `404 NOT_FOUND` — 존재하지 않는 id

---

#### 할일 등록

```
POST /api/todos
```

**요청 바디:**

```json
{
  "title": "결제 모듈 버그 수정",
  "categoryId": "770e8400-...",
  "startDate": "2026-05-13",
  "dueDate": "2026-05-13",
  "description": "선택사항"
}
```

**유효성 규칙 (클라이언트에서도 검증):**
- `title`: 필수, 최대 200자
- `categoryId`: 필수 (기본 카테고리 또는 사용자 정의 카테고리)
- `startDate`, `dueDate`: 필수, YYYY-MM-DD 형식
- `dueDate >= startDate` 조건 필수
- `description`: 선택, 최대 2000자

**성공 응답 (201):** 생성된 Todo 객체 반환

**에러:**
- `400 VALIDATION_ERROR` — 유효성 오류 또는 날짜 조건 위반
- `404 NOT_FOUND` — 존재하지 않거나 타인 소유의 categoryId

---

#### 할일 수정 (UC-05) 및 완료 토글 (UC-07)

```
PATCH /api/todos/:id
```

동일 엔드포인트를 할일 수정과 완료 토글에 공통으로 사용합니다. 변경할 필드만 포함합니다.

**완료 토글 (UC-07):**

```json
{ "isCompleted": true }
```

```json
{ "isCompleted": false }
```

**할일 수정 (UC-05):**

```json
{ "title": "변경된 제목" }
```

```json
{
  "title": "새 제목",
  "dueDate": "2026-05-20",
  "categoryId": "880e8400-..."
}
```

**성공 응답 (200):** 수정된 Todo 객체 반환

**에러:**
- `400 VALIDATION_ERROR` — dueDate < startDate
- `403 FORBIDDEN` — 타인 소유의 할일
- `404 NOT_FOUND` — 존재하지 않는 id

---

#### 할일 삭제

```
DELETE /api/todos/:id
```

**성공 응답:** 204 No Content (바디 없음)

---

### 4-4. 카테고리 (Categories)

모든 엔드포인트에 `Authorization: Bearer <token>` 필요합니다.

#### 카테고리 목록 조회

```
GET /api/categories
```

**성공 응답 (200):**

```json
{
  "data": [
    { "id": "...", "userId": null, "name": "업무", "isDefault": true, "createdAt": "..." },
    { "id": "...", "userId": null, "name": "개인", "isDefault": true, "createdAt": "..." },
    { "id": "...", "userId": null, "name": "기타", "isDefault": true, "createdAt": "..." },
    { "id": "...", "userId": "550e8400-...", "name": "마케팅", "isDefault": false, "createdAt": "..." }
  ]
}
```

기본 카테고리 (isDefault=true)와 사용자 정의 카테고리를 함께 반환합니다.

---

#### 카테고리 추가

```
POST /api/categories
```

**요청 바디:**

```json
{ "name": "마케팅" }
```

**유효성 규칙:**
- `name`: 필수, 최대 50자, 동일 사용자 내 고유

**성공 응답 (201):** 생성된 Category 객체 반환

**에러:**
- `400 VALIDATION_ERROR` — 이름 미입력 또는 50자 초과
- `409 CONFLICT` — 중복 카테고리명

---

#### 카테고리 수정

```
PATCH /api/categories/:id
```

**요청 바디:**

```json
{ "name": "마케팅팀" }
```

**성공 응답 (200):** 수정된 Category 객체 반환

**에러:**
- `403 FORBIDDEN` — 기본 카테고리(isDefault=true) 수정 시도 또는 타인 소유
- `404 NOT_FOUND` — 존재하지 않는 id
- `409 CONFLICT` — 중복 카테고리명

---

#### 카테고리 삭제

```
DELETE /api/categories/:id
```

**성공 응답:** 204 No Content (바디 없음)

**에러:**
- `403 FORBIDDEN` — 기본 카테고리 삭제 시도 또는 타인 소유
- `404 NOT_FOUND` — 존재하지 않는 id
- `409 CONFLICT` — 해당 카테고리에 연결된 할일이 있음 (할일 삭제 또는 이동 후 재시도 안내)

---

## 5. TypeScript 타입 정의 참고

```ts
// src/types/api.types.ts
export type ApiResponse<T> = { data: T };

export type ApiError = {
  error: {
    code: ErrorCode;
    message: string;
  };
};

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';
```

```ts
// src/types/auth.types.ts
export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type TokenResponse = { accessToken: string; refreshToken: string };
export type AccessTokenResponse = { accessToken: string };

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { email: string; password: string; name: string };
```

```ts
// src/types/todo.types.ts
export type Todo = {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string | null;
  startDate: string;   // YYYY-MM-DD
  dueDate: string;     // YYYY-MM-DD
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
```

```ts
// src/types/category.types.ts
export type Category = {
  id: string;
  userId: string | null;
  name: string;
  isDefault: boolean;
  createdAt: string;
};

export type CreateCategoryRequest = { name: string };
export type UpdateCategoryRequest = { name: string };
```

---

## 6. TanStack Query 캐시 키 규칙

| 쿼리 | queryKey |
|------|----------|
| 할일 목록 (필터 포함) | `['todos', filters]` |
| 할일 단건 | `['todos', id]` |
| 카테고리 목록 | `['categories']` |
| 내 정보 | `['me']` |

**캐시 무효화 규칙:**

| 이벤트 | 무효화 대상 |
|--------|-------------|
| 할일 생성/수정/삭제/완료 토글 | `['todos']` |
| 카테고리 생성/수정 | `['categories']` |
| 카테고리 삭제 | `['categories']`, `['todos']` |
| 내 정보 수정 | `['me']` |

---

## 7. 라우트 구조 및 접근 제어

| 경로 | 컴포넌트 | 인증 필요 |
|------|----------|-----------|
| `/login` | LoginPage | 미인증만 접근 |
| `/register` | RegisterPage | 미인증만 접근 |
| `/todos` | TodoListPage | 인증 필요 |
| `/categories` | CategoryPage | 인증 필요 |
| `/settings` | SettingsPage | 인증 필요 |
| `/` | — | `/todos` 리다이렉트 |

**PrivateRoute:** `authStore.accessToken`이 없으면 `/login`으로 리다이렉트합니다.

**PublicRoute (선택):** `authStore.accessToken`이 있으면 `/todos`로 리다이렉트합니다.

---

## 8. 프론트엔드 유효성 검증 체크리스트

서버에서도 동일하게 검증하지만, UX를 위해 클라이언트에서도 사전 검증합니다.

| 필드 | 규칙 |
|------|------|
| 이메일 | RFC 5321 형식 (예: `user@example.com`) |
| 비밀번호 | 최소 8자 |
| 이름 | 최대 50자, 공백만 입력 불가 |
| 할일 제목 | 최대 200자, 공백만 입력 불가 |
| 할일 설명 | 최대 2000자 |
| dueDate | startDate 이상 |
| 카테고리명 | 최대 50자, 공백만 입력 불가 |

---

## 9. 주의사항

- **기본 카테고리 처리:** `isDefault=true`인 카테고리는 수정/삭제 버튼을 UI에서 비활성화합니다.
- **카테고리 삭제 전 확인:** 삭제 시 `409 CONFLICT`가 발생할 수 있으므로 ConfirmDialog에서 "해당 카테고리의 할일을 먼저 삭제하거나 이동해주세요" 안내 문구를 준비합니다.
- **페이지 새로고침 시 토큰 소멸:** Zustand 메모리 저장 특성상 새로고침 시 토큰이 사라지며, 로그인 페이지로 이동합니다. 이는 의도된 동작입니다.
- **날짜 형식:** API 요청/응답 모두 `YYYY-MM-DD` (날짜), ISO 8601 (날짜시간) 형식을 사용합니다.
- **Swagger UI:** 개발 환경에서 `http://localhost:3000/api-docs/`로 접속하여 전체 API를 인터랙티브하게 테스트할 수 있습니다.
