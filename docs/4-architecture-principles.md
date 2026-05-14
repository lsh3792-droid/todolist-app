# TodolistApp 프로젝트 구조 설계 원칙

**버전:** 1.0
**작성일:** 2026-05-13
**참조 문서:**
- 도메인 정의서 v1.2 (`1-domain-definition.md`)
- PRD v1.2 (`2-prd.md`)
- 사용자 시나리오 v1.0 (`3-user-scenario.md`)

---

## 1. 최상위 공통 원칙

### 원칙 1: 소유권(Ownership) 검증은 서버에서 반드시 수행한다

**왜 이 원칙인가**
TodolistApp은 사용자별 데이터를 격리하는 것이 핵심 보안 요구사항이다(BR-3.2.2, BR-3.3.2). 클라이언트는 신뢰할 수 없으며, UI에서 버튼을 숨기는 것만으로는 보호가 되지 않는다.

**이 프로젝트에서 어떻게 적용하는가**
- 모든 Todo/Category CRUD 엔드포인트에서 `req.user.id`와 DB에서 조회한 리소스의 `userId`를 반드시 비교한다.
- 일치하지 않으면 `403 Forbidden`을 반환한다. 404로 처리하여 존재 여부를 노출하지 않을 수도 있으나, 이 프로젝트에서는 403을 명시적으로 사용한다(도메인 정의서 시나리오 기준).
- 기본 카테고리(`isDefault = true`) 수정/삭제 시도도 동일하게 `403 Forbidden`을 반환한다.

---

### 원칙 2: 서버 측 입력 유효성 검증을 단일 진실의 원천으로 삼는다

**왜 이 원칙인가**
클라이언트 검증은 UX 보조 역할에 불과하다. API를 직접 호출하면 클라이언트 검증을 우회할 수 있으므로, 서버가 모든 유효성 검증의 최종 보루가 되어야 한다(PRD §5.2).

**이 프로젝트에서 어떻게 적용하는가**
- 필드 길이(title 200자, description 2000자, name 50자), 형식(이메일 RFC 5321), 날짜 관계(`dueDate >= startDate`)는 모두 서버 Controller/Service 레이어에서 검증한다.
- 검증 실패 시 일관된 `400 Bad Request` 형식으로 응답한다.
- 프론트엔드의 클라이언트 검증은 즉각적인 인라인 피드백을 위한 UX 도구로만 사용하고, 서버 검증을 대체하지 않는다.

---

### 원칙 3: 환경별 설정은 코드에 하드코딩하지 않고 환경변수로 분리한다

**왜 이 원칙인가**
JWT 시크릿, DB 연결 문자열, CORS 허용 Origin 등 환경에 따라 달라지는 값이 코드에 포함되면 보안 사고와 환경 간 혼용 오류가 발생한다.

**이 프로젝트에서 어떻게 적용하는가**
- 백엔드는 `.env` 파일로 관리하며 `.env.example`을 레포에 커밋하여 필요한 변수 목록을 명시한다.
- `process.env.JWT_SECRET`, `process.env.DATABASE_URL` 등 시작 시 누락된 필수 환경변수가 있으면 서버 기동을 중단한다.
- 프론트엔드는 `VITE_API_BASE_URL` 등 빌드 시점 환경변수를 사용한다.

---

### 원칙 4: 단일 책임 — 한 모듈은 한 가지 이유로만 변경된다

**왜 이 원칙인가**
백엔드 Controller가 SQL을 직접 실행하거나, Repository가 HTTP 응답 형식을 알고 있으면 변경 범위가 넓어지고 테스트가 어려워진다.

**이 프로젝트에서 어떻게 적용하는가**
- 백엔드: Controller는 HTTP 요청/응답 처리만, Service는 비즈니스 규칙 검증만, Repository는 SQL 쿼리 실행만 담당한다.
- 프론트엔드: UI 컴포넌트는 렌더링만, 커스텀 훅은 데이터 조회 및 변환만, 스토어는 전역 클라이언트 상태만 담당한다.

---

### 원칙 5: 에러는 명확하게 분류하고 일관된 형식으로 응답한다

**왜 이 원칙인가**
프론트엔드가 에러 유형에 따라 다른 UX 처리(인라인 메시지, 토스트, 로그인 리다이렉트)를 해야 하므로, 예측 가능한 에러 응답 구조가 필수다.

**이 프로젝트에서 어떻게 적용하는가**
- 모든 에러 응답은 `{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }` 구조를 따른다.
- HTTP 상태 코드와 `code` 필드의 조합으로 에러 유형을 식별한다.
- 예상치 못한 서버 오류는 `500 Internal Server Error`로 반환하되, 내부 스택 트레이스는 클라이언트에 노출하지 않는다.

---

### 원칙 6: ORM을 사용하지 않고 pg 라이브러리로 SQL을 직접 작성한다

**왜 이 원칙인가**
PRD에서 명시적으로 ORM 사용을 금지하고 있다(PRD §6.2). SQL을 직접 작성하면 실행되는 쿼리를 정확히 파악할 수 있고, PostgreSQL 17의 기능을 제한 없이 활용할 수 있다.

**이 프로젝트에서 어떻게 적용하는가**
- 모든 DB 접근은 `pg` 라이브러리의 `pool.query(sql, params)` 형태로 작성한다.
- SQL 인젝션 방어를 위해 모든 외부 입력값은 반드시 파라미터화된 쿼리(`$1`, `$2`, ...)를 사용한다. 문자열 보간으로 SQL을 조립하는 것을 금지한다.
- 복잡한 필터 조합(UC-08)도 파라미터 배열을 동적으로 구성하는 방식으로 구현한다.

---

### 원칙 7: 관심사별 명확한 경계를 유지하되, 불필요한 추상화는 도입하지 않는다

**왜 이 원칙인가**
소규모 개인 프로젝트로 동시 접속 300명 규모이며 개발 기간이 3일이다. 과도한 추상화 레이어는 개발 속도를 저하시키고 코드 복잡도를 높인다.

**이 프로젝트에서 어떻게 적용하는가**
- 3개의 바운디드 컨텍스트(인증/사용자, 할일, 카테고리) 경계는 디렉토리 구조로 반영하되, 별도의 마이크로서비스로 분리하지 않는다.
- 공통 로직(인증 미들웨어, 에러 응답 헬퍼)만 유틸리티로 추출하고, 사용처가 하나인 코드는 분리하지 않는다.
- 제네릭 Repository 추상 클래스, 팩토리 패턴 등 복잡한 패턴은 도입하지 않는다.

---

## 2. 의존성 / 레이어 원칙

### 2.1 백엔드 레이어 구조

백엔드는 Controller → Service → Repository 3계층 구조를 따른다.

```
HTTP Request
     ↓
[Router]           : URL 라우팅, 미들웨어 연결
     ↓
[Controller]       : 요청 파싱, 응답 직렬화, HTTP 상태 코드 결정
     ↓
[Service]          : 비즈니스 규칙 검증, 트랜잭션 조율, 도메인 로직
     ↓
[Repository]       : SQL 쿼리 실행, DB 결과 반환
     ↓
[Database (pg)]    : PostgreSQL 17
```

**각 레이어의 책임**

| 레이어 | 책임 | 하지 말아야 할 것 |
|--------|------|------------------|
| Router | Express 라우트 등록, 미들웨어 체인 구성 | 비즈니스 로직 |
| Controller | `req` 파싱, `res.json()` 호출, HTTP 상태 결정 | SQL 실행, 비즈니스 규칙 |
| Service | 소유권 검증, 비즈니스 규칙(BR-*) 적용, 다중 Repository 조율 | `req`/`res` 참조, SQL 직접 작성 |
| Repository | `pool.query()` 호출, SQL 반환값을 도메인 객체로 변환 | 비즈니스 규칙, HTTP 개념 |

---

### 2.2 레이어 간 의존 방향 규칙

의존 방향은 단방향이며 역방향 참조는 금지한다.

```
Controller → Service → Repository → pg pool
```

- Controller는 Service를 직접 호출한다. Repository를 직접 호출하지 않는다.
- Service는 Repository를 호출한다. Controller를 참조하지 않는다.
- Repository는 `pg` 라이브러리만 의존한다. Service/Controller를 참조하지 않는다.
- 미들웨어는 Controller 진입 전에 실행되며, Controller 내부에서 미들웨어를 호출하지 않는다.

**크로스 컨텍스트 의존:**
- Todo Service가 카테고리 소유권을 검증해야 할 때는 CategoryRepository를 직접 호출한다(동일 DB 내 단순 조회이므로 별도 HTTP 호출 불필요).

---

### 2.3 프론트엔드 관심사 분리 원칙

```
[Page / View]
    ↓ 사용
[Feature Components]     : 도메인별 UI (TodoList, CategoryManager 등)
    ↓ 사용
[Common Components]      : 재사용 UI (Button, Modal, Input 등)
    ↓ 사용
[Custom Hooks]           : 데이터 조회·변형 로직, 이벤트 핸들러 조합
    ↓ 사용
[API Layer]              : TanStack Query useQuery/useMutation + fetch 호출
[Zustand Store]          : 클라이언트 전역 상태 (Access Token, 현재 사용자 정보 등)
```

**각 레이어의 책임**

| 레이어 | 책임 | 하지 말아야 할 것 |
|--------|------|------------------|
| Page/View | 레이아웃, 라우팅 단위 구성 | fetch 직접 호출, 비즈니스 로직 |
| Feature Component | 도메인 특화 UI 렌더링 | 직접 API 호출 |
| Common Component | 재사용 가능한 순수 UI | 서버 상태 의존 |
| Custom Hook | 데이터 로직 캡슐화 | `res.json()` 수준의 처리, UI 렌더링 |
| API Layer | HTTP 요청/응답 처리, TanStack Query 정의 | 상태 저장, UI 로직 |
| Zustand Store | 클라이언트 전역 상태 관리 | 서버 데이터 캐싱 |

---

### 2.4 Zustand와 TanStack Query 역할 분리 기준

두 라이브러리의 역할을 명확히 분리하여 중복 상태 관리를 방지한다.

**Zustand (클라이언트 상태) — 서버와 무관한 클라이언트 상태**

| 용도 | 예시 |
|------|------|
| 인증 상태 | Access Token (메모리), 현재 로그인 사용자 정보 |
| UI 전역 상태 | 모달 열림/닫힘, 사이드바 상태 |
| 필터 상태 (URL 미반영 시) | 현재 선택된 필터 조건 |

```typescript
// 예시: authStore
interface AuthStore {
  accessToken: string | null;
  currentUser: { id: string; name: string; email: string } | null;
  setAuth: (token: string, user: AuthStore['currentUser']) => void;
  clearAuth: () => void;
}
```

**TanStack Query (서버 상태) — 서버에서 가져오는 모든 데이터**

| 용도 | 예시 |
|------|------|
| 서버 데이터 캐싱 | Todo 목록, Category 목록 |
| 데이터 변경(Mutation) | Todo 생성/수정/삭제, Category 추가/삭제 |
| 자동 리페치 | 화면 포커스 복귀 시 목록 갱신 |
| 로딩/에러 상태 | `isLoading`, `isError` |

```typescript
// 예시: useTodos hook
const useTodos = (filters: TodoFilters) => {
  return useQuery({
    queryKey: ['todos', filters],
    queryFn: () => todoApi.getAll(filters),
  });
};
```

**판단 기준:**
- 서버 API를 통해 가져오는 데이터라면 TanStack Query를 사용한다.
- 서버와 무관하게 클라이언트에서만 존재하는 상태라면 Zustand를 사용한다.
- Access Token은 Zustand로 메모리에 보관한다. 서버 데이터이지만 캐싱보다는 인증 상태 관리 개념이기 때문이다.

---

## 3. 코드 / 네이밍 원칙

### 3.1 파일·디렉토리 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 백엔드 디렉토리 | camelCase | `controllers/`, `repositories/` |
| 백엔드 파일 | camelCase | `todoController.js`, `authService.js` |
| 프론트엔드 컴포넌트 파일 | PascalCase | `TodoCard.tsx`, `CategoryModal.tsx` |
| 프론트엔드 비컴포넌트 파일 | camelCase | `useTodos.ts`, `todoApi.ts`, `authStore.ts` |
| 프론트엔드 디렉토리 | camelCase | `hooks/`, `stores/`, `api/` |
| 타입 정의 파일 | camelCase, `.types.ts` 접미사 | `todo.types.ts`, `auth.types.ts` |
| 환경변수 파일 | 고정 이름 | `.env`, `.env.example` |
| 마이그레이션 파일 | 날짜+설명 kebab-case | `001-create-users-table.sql` |

---

### 3.2 함수·변수·타입 네이밍 규칙

**공통**
- 변수·함수: camelCase (`userId`, `getTodos`, `isCompleted`)
- 상수(변경 불가): UPPER_SNAKE_CASE (`JWT_EXPIRES_IN`, `MAX_TITLE_LENGTH`)

**백엔드 네이밍 패턴**

| 대상 | 패턴 | 예시 |
|------|------|------|
| Controller 함수 | 동사 + 명사 | `createTodo`, `getTodos`, `deleteTodo` |
| Service 함수 | 동사 + 명사 | `createTodo`, `validateOwnership` |
| Repository 함수 | CRUD 동사 + 명사 | `findById`, `findAllByUserId`, `create`, `update`, `remove` |
| 미들웨어 파일 | 역할 설명 | `authenticate.js`, `errorHandler.js` |

**프론트엔드 네이밍 패턴**

| 대상 | 패턴 | 예시 |
|------|------|------|
| 커스텀 훅 | `use` + 명사 또는 동사 | `useTodos`, `useCreateTodo`, `useAuth` |
| TanStack Query queryKey | 문자열 배열, 리소스 이름 | `['todos', filters]`, `['categories']` |
| Zustand 스토어 | 명사 + `Store` | `authStore`, `uiStore` |
| API 함수 파일 | 리소스명 + `Api` | `todoApi.ts`, `categoryApi.ts` |
| 이벤트 핸들러 | `handle` + 이벤트 | `handleSubmit`, `handleDelete` |

---

### 3.3 백엔드 응답 형식 통일 규칙

모든 API 응답은 아래 구조를 따른다.

**성공 응답**

단일 리소스 반환:
```json
{
  "data": {
    "id": "uuid",
    "title": "결제 모듈 버그 수정",
    "isCompleted": false,
    "createdAt": "2026-05-13T09:00:00Z"
  }
}
```

목록 반환:
```json
{
  "data": [
    { "id": "uuid", "title": "...", "isCompleted": false }
  ]
}
```

삭제 성공 (`204 No Content`): 응답 바디 없음

**에러 응답**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "종료예정일은 시작일 이후여야 합니다"
  }
}
```

**에러 코드 목록**

| code | HTTP 상태 | 설명 |
|------|-----------|------|
| `VALIDATION_ERROR` | 400 | 입력값 유효성 실패 |
| `UNAUTHORIZED` | 401 | 인증 토큰 없음 또는 만료 |
| `FORBIDDEN` | 403 | 소유권 없음 또는 기본 카테고리 수정/삭제 시도 |
| `NOT_FOUND` | 404 | 리소스 존재하지 않음 |
| `CONFLICT` | 409 | 중복 데이터 (이메일, 카테고리명) 또는 연결 할일 존재 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |

---

### 3.4 언어 사용 원칙

**백엔드: 순수 JavaScript (TypeScript 사용 안 함)**

- 백엔드는 Node.js 기반 순수 JavaScript(`.js`)로 구현한다. TypeScript, ts-node, 트랜스파일 단계 없이 Node.js가 파일을 직접 실행한다.
- 타입 정보가 필요한 경우 JSDoc 주석(`@param`, `@returns`)으로 명시한다.

**프론트엔드: TypeScript**

1. **`any` 타입 사용 금지.** 불확실한 경우 `unknown`을 사용하고 타입 가드를 적용한다.
2. **타입 정의 위치 규칙:**
   - 공유 타입: `src/types/` 디렉토리의 도메인별 파일 (`todo.types.ts`, `category.types.ts`, `auth.types.ts`)
   - 특정 컴포넌트/훅에서만 사용하는 타입: 해당 파일 내 로컬 선언
   - API 요청/응답 타입: `src/api/` 레이어에 정의
3. **`interface` vs `type`:** 도메인 엔티티는 `interface`, 유니온/교차 타입은 `type alias`를 사용한다.
4. **`strict` 모드 활성화.** `tsconfig.json`에서 `"strict": true`를 설정하여 암묵적 any, null 체크를 강제한다.
5. **타입/인터페이스 이름:** PascalCase (`Todo`, `CreateTodoRequest`, `ApiResponse`)

---

## 4. 테스트 / 품질 원칙

### 4.1 현실적인 테스트 전략 (3일 개발 일정 기준)

3일 MVP 개발 일정에서 전체 코드에 대한 완전한 테스트 커버리지는 현실적이지 않다. 따라서 버그 발생 시 서비스 가치를 직접 훼손하는 핵심 케이스에 집중한다.

**테스트 우선순위**

| 우선순위 | 대상 | 이유 |
|----------|------|------|
| P0 (반드시) | 인증 흐름, 소유권 검증 | 보안 사고 방지 |
| P0 (반드시) | 비즈니스 규칙 핵심 케이스 | 데이터 무결성 |
| P1 (권장) | 에러 응답 형식 | 프론트엔드 연동 안정성 |
| P2 (여유 시) | 정상 흐름 통합 테스트 | 회귀 방지 |

**테스트 도구**
- 백엔드: Jest + Supertest (API 통합 테스트)
- 프론트엔드: Vitest + React Testing Library (단위·컴포넌트 테스트)

---

### 4.2 최소 보장 테스트 범위

개발 완료 전 반드시 검증해야 하는 테스트 케이스이다.

**인증 관련**
- 유효하지 않은 토큰으로 보호된 엔드포인트 접근 시 `401` 반환
- 만료된 Access Token으로 `/api/auth/refresh` 호출 시 새 Access Token 발급
- 만료된 Refresh Token으로 갱신 시도 시 `401` 반환
- 비밀번호 불일치 로그인 시 `401` 반환 (이메일 존재 여부 미노출)

**소유권 검증**
- 타인의 Todo를 수정/삭제 시도 시 `403` 반환
- 타인의 Category를 수정/삭제 시도 시 `403` 반환
- 타인의 categoryId로 Todo 등록 시도 시 `404` 반환

**비즈니스 규칙 핵심**
- `dueDate < startDate`인 Todo 등록 시 `400` 반환 (BR-3.2.4)
- 할일이 연결된 Category 삭제 시도 시 `409` 반환 (BR-3.3.3)
- 기본 카테고리(`isDefault=true`) 삭제 시도 시 `403` 반환 (BR-3.3.1)
- 동일 사용자 내 중복 Category명 생성 시 `409` 반환
- 중복 이메일 회원가입 시 `409` 반환 (BR-3.1.1)

---

### 4.3 코드 품질 도구 설정 방향

**ESLint**
- 백엔드: `eslint:recommended` 규칙 세트 기반
- 프론트엔드: `eslint:recommended` + `@typescript-eslint/recommended` + `react-hooks/recommended`
- 공통 규칙: `no-console` (warn 수준, 운영 로그는 구조화 로거 사용), `no-unused-vars` (error)

**Prettier**
- 탭 대신 스페이스 2칸, 세미콜론 필수, 작은따옴표 사용
- ESLint와 충돌 방지를 위해 `eslint-config-prettier` 적용

**husky + lint-staged**
- git commit 전 변경된 파일에 대해 ESLint + Prettier 자동 실행
- 린트 오류가 있으면 커밋 차단

---

## 5. 설정 / 보안 / 운영 원칙

### 5.1 환경변수 관리 원칙

**백엔드 환경변수 구분**

```
# .env (gitignore에 포함, 커밋 금지)
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/todolist
JWT_SECRET=your-secret-key-minimum-32-chars
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ALLOWED_ORIGIN=http://localhost:5173
BCRYPT_SALT_ROUNDS=10

# .env.example (레포에 커밋, 필요한 변수 명세)
NODE_ENV=
PORT=3000
DATABASE_URL=
JWT_SECRET=
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ALLOWED_ORIGIN=
BCRYPT_SALT_ROUNDS=10
```

**프론트엔드 환경변수 구분**

```
# .env.development
VITE_API_BASE_URL=http://localhost:3000

# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com
```

**시작 시 필수 환경변수 검증:** `config/validateEnv.js`에서 서버 기동 시 필수 변수 누락 여부를 확인하고 누락 시 프로세스를 종료한다.

```javascript
// config/validateEnv.js
const required = ['DATABASE_URL', 'JWT_SECRET', 'CORS_ALLOWED_ORIGIN'];
required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`필수 환경변수 누락: ${key}`);
    process.exit(1);
  }
});
```

---

### 5.2 보안 원칙

**JWT 처리**
- Access Token과 Refresh Token 모두 Zustand 스토어(메모리)에만 저장한다. `localStorage`/`sessionStorage`/Cookie에 저장하지 않는다.
- 로그인·토큰 재발급 응답 바디로 두 토큰을 수신하고 Zustand에 보관한다. 페이지 새로고침 시 메모리가 초기화되어 재로그인이 필요하다.
- JWT 시크릿은 최소 32자 이상의 무작위 문자열을 사용한다.
- Access Token 재발급 엔드포인트(`POST /api/auth/refresh`)는 요청 바디의 `{ refreshToken }` 으로 인증한다. Cookie를 사용하지 않는다.
- 로그아웃은 서버 요청 없이 Zustand 스토어를 초기화하여 두 토큰을 즉시 삭제한다.

**CORS 설정**
- 허용 Origin을 환경변수로 명시한다. `*` 와일드카드는 절대 사용하지 않는다.
- Cookie를 사용하지 않으므로 `credentials: true` 설정이 불필요하다.
- 허용 메서드: `GET, POST, PATCH, DELETE, OPTIONS`
- 허용 헤더: `Content-Type, Authorization`

```javascript
// 예시: CORS 설정
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**SQL Injection 방어**
- `pg` 라이브러리의 파라미터화된 쿼리를 반드시 사용한다.
- 동적 필터 조건은 파라미터 배열과 조건 인덱스(`$1`, `$2`, ...)를 동적으로 구성한다.

```javascript
// 올바른 방법
const result = await pool.query(
  'SELECT * FROM todos WHERE user_id = $1 AND id = $2',
  [userId, todoId]
);

// 금지: 문자열 보간
// const result = await pool.query(`SELECT * FROM todos WHERE user_id = '${userId}'`);
```

**비밀번호 처리**
- bcrypt salt rounds는 최소 10으로 설정한다(`BCRYPT_SALT_ROUNDS=10`).
- 응답에서 `password` 필드를 절대 포함하지 않는다. Repository에서 SELECT 시 `password` 컬럼을 명시적으로 제외한다.

**입력값 검증 순서:** 인증 확인 → 입력값 유효성 검증 → 소유권 검증 → 비즈니스 규칙 검증 → DB 작업

---

### 5.3 에러 처리 원칙

**글로벌 에러 핸들러**
- Express 글로벌 에러 핸들러를 `middlewares/errorHandler.js`에 정의하고, `app.js`에서 마지막 미들웨어로 등록한다.
- 모든 예상 가능한 에러는 커스텀 에러 클래스를 사용하여 throw하고, 글로벌 핸들러가 일관된 형식으로 응답한다.

```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// 사용 예시 (Service 레이어)
if (todo.userId !== requestUserId) {
  throw new AppError(403, 'FORBIDDEN', '해당 리소스에 대한 접근 권한이 없습니다');
}
```

```javascript
// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message }
    });
  }
  // 예상치 못한 에러
  console.error(err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: '서버 내부 오류가 발생했습니다' }
  });
};
```

**비동기 에러 전달:**
- Express 5를 사용하지 않는 경우, 모든 비동기 Controller 함수에서 `try/catch`로 에러를 `next(err)`로 전달한다.
- 반복을 줄이기 위해 `asyncHandler` 래퍼를 `utils/asyncHandler.js`에 정의하여 사용한다.

```javascript
// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

---

### 5.4 로깅 원칙

**이 프로젝트의 로깅 수준:**
소규모 개인 프로젝트이므로 분산 추적 시스템이나 중앙 로그 수집 인프라는 도입하지 않는다. `console` 대신 경량 구조화 로거(`morgan` + 커스텀 로그)를 사용한다.

**로깅 항목**

| 항목 | 로그 수준 | 내용 |
|------|-----------|------|
| HTTP 요청/응답 | info | `morgan`으로 메서드, URL, 상태코드, 응답시간 기록 |
| 예상 가능한 에러 (4xx) | warn | 에러 코드, 메시지 (스택 트레이스 제외) |
| 예상치 못한 서버 오류 (5xx) | error | 스택 트레이스 포함, 운영에서는 외부 모니터링 전송 고려 |
| DB 연결 성공/실패 | info/error | 서버 시작 시 DB 연결 상태 확인 |

**주의 사항:**
- 로그에 비밀번호, Access Token, Refresh Token 값을 절대 포함하지 않는다.
- HTTP 요청/응답 로그는 `morgan`을 통해 출력한다.
- Controller 레이어의 주요 처리 지점(요청 수신, 완료)은 `console.log`로 기록한다. 로그 포맷: `[도메인] 동작 - 주요 식별자`.

---

## 6. 디렉토리 구조

### 6.1 백엔드 디렉토리 구조

Node.js + Express + pg 기준, Controller-Service-Repository 패턴을 적용한다.

```plaintext
backend/
├── src/
│   ├── app.js                        # Express 앱 설정, 미들웨어 등록, Swagger UI(/api-docs) 마운트
│   ├── server.js                     # HTTP 서버 시작 진입점
│   │
│   ├── config/
│   │   ├── validateEnv.js            # 필수 환경변수 검증 (서버 시작 시 실행)
│   │   └── corsOptions.js            # CORS 설정 객체
│   │
│   ├── db/
│   │   ├── pool.js                   # pg Pool 인스턴스 생성 및 내보내기
│   │   ├── migrations/
│   │   │   ├── 001-create-users-table.sql
│   │   │   ├── 002-create-categories-table.sql
│   │   │   └── 003-create-todos-table.sql
│   │   └── seeds/
│   │       └── defaultCategories.js  # 기본 카테고리 시딩 (업무, 개인, 기타)
│   │
│   ├── routes/
│   │   ├── index.js                  # 라우트 통합 등록 (/api/auth, /api/todos 등)
│   │   ├── authRoutes.js             # POST /auth/register, /auth/login, /auth/refresh
│   │   ├── userRoutes.js             # GET/PATCH/DELETE /users/me
│   │   ├── todoRoutes.js             # CRUD /todos, /todos/:id
│   │   └── categoryRoutes.js         # CRUD /categories, /categories/:id
│   │
│   ├── controllers/
│   │   ├── authController.js         # register, login, refreshToken
│   │   ├── userController.js         # getMe, updateMe, deleteMe
│   │   ├── todoController.js         # createTodo, getTodos, getTodoById, updateTodo, deleteTodo
│   │   └── categoryController.js     # createCategory, getCategories, updateCategory, deleteCategory
│   │
│   ├── services/
│   │   ├── authService.js            # 회원가입, 로그인, 토큰 발급/검증 비즈니스 로직
│   │   ├── userService.js            # 사용자 정보 수정, 회원 탈퇴 비즈니스 로직
│   │   ├── todoService.js            # 할일 CRUD, 소유권 검증, 날짜 규칙 검증
│   │   └── categoryService.js        # 카테고리 CRUD, 소유권 검증, 기본 카테고리 보호 로직
│   │
│   ├── repositories/
│   │   ├── userRepository.js         # findByEmail, findById, create, update, remove
│   │   ├── todoRepository.js         # findAllByUserId, findById, create, update, remove
│   │   └── categoryRepository.js     # findAllByUser, findById, create, update, remove
│   │
│   ├── middlewares/
│   │   ├── authenticate.js           # JWT Access Token 검증, req.user 세팅
│   │   └── errorHandler.js           # 글로벌 에러 핸들러 (4xx/5xx 일관된 응답 형식)
│   │
│   └── utils/
│       ├── AppError.js               # 커스텀 에러 클래스 (statusCode, code, message)
│       ├── asyncHandler.js           # 비동기 Controller 래퍼 (try/catch → next(err))
│       └── tokenHelper.js            # JWT 서명(signToken), 검증(verifyToken) 유틸
│
├── tests/
│   ├── auth.test.js                  # 인증 흐름 통합 테스트
│   ├── todo.test.js                  # Todo CRUD + 소유권 검증 테스트
│   └── category.test.js              # Category CRUD + 비즈니스 규칙 테스트
│
├── .env                              # 환경변수 (gitignore)
├── .env.example                      # 환경변수 명세 (레포 포함)
├── .eslintrc.js                      # ESLint 설정
├── .prettierrc                       # Prettier 설정
├── package.json
└── jest.config.js
```

---

### 6.2 프론트엔드 디렉토리 구조

React 19 + TypeScript + Zustand + TanStack Query 기준이다.

```plaintext
frontend/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.tsx                      # React 앱 진입점, QueryClientProvider, Router 설정
│   ├── App.tsx                       # 라우트 정의 (React Router), 인증 상태 초기화
│   │
│   ├── pages/                        # 라우트 단위 페이지 컴포넌트
│   │   ├── LoginPage.tsx             # UC-02 로그인 화면
│   │   ├── RegisterPage.tsx          # UC-01 회원가입 화면
│   │   ├── TodoListPage.tsx          # UC-08 메인 할일 목록 화면 (필터 + 목록)
│   │   ├── CategoryPage.tsx          # UC-09~11 카테고리 관리 화면
│   │   └── SettingsPage.tsx          # UC-03 사용자 설정 + 회원 탈퇴
│   │
│   ├── components/                   # 재사용 공통 UI 컴포넌트 (도메인 무관)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── ConfirmDialog.tsx         # 삭제 확인 다이얼로그
│   │   └── Spinner.tsx
│   │
│   ├── features/                     # 도메인별 기능 컴포넌트
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx         # 이메일·비밀번호 입력 폼
│   │   │   └── RegisterForm.tsx      # 회원가입 입력 폼
│   │   │
│   │   ├── todo/
│   │   │   ├── TodoList.tsx          # 할일 목록 렌더링
│   │   │   ├── TodoCard.tsx          # 개별 할일 카드 (완료 토글, 수정/삭제 버튼)
│   │   │   ├── TodoForm.tsx          # 할일 등록/수정 폼
│   │   │   ├── TodoFilterBar.tsx     # categoryId, isCompleted, dueDateFrom~To 필터 UI
│   │   │   └── TodoModal.tsx         # TodoForm을 감싸는 모달
│   │   │
│   │   └── category/
│   │       ├── CategoryList.tsx      # 카테고리 목록 (기본 + 사용자 정의)
│   │       ├── CategoryItem.tsx      # 개별 카테고리 (수정/삭제 버튼, 기본 카테고리는 비활성화)
│   │       └── CategoryForm.tsx      # 카테고리 추가/수정 인라인 폼
│   │
│   ├── hooks/                        # 커스텀 훅 (TanStack Query 훅 포함)
│   │   ├── auth/
│   │   │   ├── useLogin.ts           # useMutation: POST /api/auth/login
│   │   │   ├── useRegister.ts        # useMutation: POST /api/auth/register
│   │   │   └── useLogout.ts          # useMutation: POST /api/auth/logout
│   │   │
│   │   ├── todo/
│   │   │   ├── useTodos.ts           # useQuery: GET /api/todos?[filters]
│   │   │   ├── useCreateTodo.ts      # useMutation: POST /api/todos
│   │   │   ├── useUpdateTodo.ts      # useMutation: PATCH /api/todos/:id
│   │   │   └── useDeleteTodo.ts      # useMutation: DELETE /api/todos/:id
│   │   │
│   │   └── category/
│   │       ├── useCategories.ts      # useQuery: GET /api/categories
│   │       ├── useCreateCategory.ts  # useMutation: POST /api/categories
│   │       ├── useUpdateCategory.ts  # useMutation: PATCH /api/categories/:id
│   │       └── useDeleteCategory.ts  # useMutation: DELETE /api/categories/:id
│   │
│   ├── stores/                       # Zustand 스토어 (클라이언트 전역 상태)
│   │   ├── authStore.ts              # accessToken, currentUser, setAuth, clearAuth
│   │   └── uiStore.ts                # 모달 열림 상태, 토스트 메시지 등
│   │
│   ├── api/                          # HTTP 클라이언트 레이어
│   │   ├── client.ts                 # fetch/axios 인스턴스, 인터셉터 (401 시 자동 토큰 갱신)
│   │   ├── authApi.ts                # register, login, logout, refresh 요청 함수
│   │   ├── userApi.ts                # getMe, updateMe, deleteMe 요청 함수
│   │   ├── todoApi.ts                # getAll, getById, create, update, remove 요청 함수
│   │   └── categoryApi.ts            # getAll, create, update, remove 요청 함수
│   │
│   ├── types/                        # TypeScript 타입 정의
│   │   ├── todo.types.ts             # Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilters
│   │   ├── category.types.ts         # Category, CreateCategoryRequest, UpdateCategoryRequest
│   │   ├── auth.types.ts             # User, LoginRequest, RegisterRequest, TokenResponse
│   │   └── api.types.ts              # ApiResponse<T>, ApiError, ErrorCode
│   │
│   └── utils/
│       ├── dateUtils.ts              # 날짜 포맷 변환 유틸 (YYYY-MM-DD 등)
│       └── validationUtils.ts        # 이메일 형식, 날짜 범위 클라이언트 검증 함수
│
├── .env.development                  # 개발 환경 변수
├── .env.production                   # 운영 환경 변수
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

### 6.3 모노레포 vs 멀티레포

**선택: 모노레포 (단일 레포지토리)**

```plaintext
TODOLIST-APP/                         # 루트 레포지토리
├── backend/                          # Node.js + Express + pg 백엔드
├── frontend/                         # React 19 + TypeScript 프론트엔드
├── docs/                             # 프로젝트 문서
│   ├── 1-domain-definition.md
│   ├── 2-prd.md
│   ├── 3-user-scenario.md
│   ├── 4-architecture-principles.md
│   ├── 5-arch-diagram.md
│   └── 99-uc.md
└── README.md
```

**선택 이유:**

| 항목 | 내용 |
|------|------|
| 개발 규모 | 1인 개인 프로젝트로, 레포 분리 관리 오버헤드를 감수할 이유가 없다 |
| 개발 기간 | 3일 일정에서 레포 간 PR 연동, 버전 태그 동기화 등의 작업은 시간 낭비다 |
| 변경 원자성 | 도메인 모델 변경(예: Todo 필드 추가) 시 백엔드와 프론트엔드를 단일 커밋으로 원자적으로 반영할 수 있다 |
| 공유 코드 없음 | 현재 규모에서 백엔드와 프론트엔드가 공유할 코드가 없으므로 npm workspace/turborepo 등 모노레포 도구는 불필요하다 |
| 단순 구조 | `backend/`와 `frontend/` 두 디렉토리로 구분하는 것으로 충분하다. 빌드/배포 스크립트만 각 디렉토리별로 분리 관리한다 |

**멀티레포를 선택했을 경우의 불편함 (채택하지 않은 이유):**
- 타입/모델 변경 시 두 레포에 각각 PR을 생성해야 한다.
- 로컬 개발 시 두 레포를 동시에 clone하고 관리해야 한다.
- 코드 리뷰, 이슈 트래킹이 두 레포에 분산된다.
