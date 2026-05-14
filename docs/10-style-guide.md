# 프론트엔드 스타일 가이드

**버전:** 1.0  
**작성일:** 2026-05-14  
**디자인 레퍼런스:** Google Calendar 다크 테마

---

## 1. 디자인 원칙

- **다크 테마 우선:** 배경은 거의 검정에 가까운 짙은 회색, 콘텐츠 계층은 미묘한 밝기 차이로 구분
- **미니멀:** 불필요한 장식 없이 콘텐츠 중심
- **명확한 계층:** 배경 → 서피스 → 컴포넌트 순으로 밝기가 단계적으로 높아짐
- **포인트 컬러는 하나:** 파란색(Primary Blue)만 강조에 사용

---

## 2. 컬러 시스템

### 배경 계층

| 토큰 | 값 | 용도 |
|------|----|------|
| `--color-bg` | `#1f1f1f` | 최상위 페이지 배경 |
| `--color-surface` | `#2d2d2d` | 사이드바, 카드, 패널 배경 |
| `--color-surface-raised` | `#3c3c3c` | 호버 상태, 팝업, 드롭다운 |
| `--color-border` | `#3f3f3f` | 구분선, 테두리 |

### 텍스트

| 토큰 | 값 | 용도 |
|------|----|------|
| `--color-text-primary` | `#e8eaed` | 주요 텍스트 (제목, 본문) |
| `--color-text-secondary` | `#9aa0a6` | 보조 텍스트 (레이블, 날짜) |
| `--color-text-disabled` | `#5f6368` | 비활성 텍스트 |

### 포인트 컬러

| 토큰 | 값 | 용도 |
|------|----|------|
| `--color-primary` | `#1a73e8` | 버튼, 체크박스, 오늘 날짜 강조, 링크 |
| `--color-primary-hover` | `#1557b0` | Primary 호버 상태 |
| `--color-primary-surface` | `#1a73e826` | Primary 배경 틴트 (선택 상태 배경) |

### 상태 컬러

| 토큰 | 값 | 용도 |
|------|----|------|
| `--color-danger` | `#f28b82` | 삭제, 에러, 경고 버튼 |
| `--color-danger-hover` | `#ee675c` | Danger 호버 |
| `--color-success` | `#81c995` | 완료 상태, 성공 토스트 |
| `--color-warning` | `#fdd663` | 경고 토스트 |

### CSS 변수 선언 예시

```css
:root {
  --color-bg: #1f1f1f;
  --color-surface: #2d2d2d;
  --color-surface-raised: #3c3c3c;
  --color-border: #3f3f3f;

  --color-text-primary: #e8eaed;
  --color-text-secondary: #9aa0a6;
  --color-text-disabled: #5f6368;

  --color-primary: #1a73e8;
  --color-primary-hover: #1557b0;
  --color-primary-surface: rgba(26, 115, 232, 0.15);

  --color-danger: #f28b82;
  --color-danger-hover: #ee675c;
  --color-success: #81c995;
  --color-warning: #fdd663;
}
```

---

## 3. 타이포그래피

### 폰트

```css
font-family: 'Google Sans', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
```

Google Sans가 없는 환경에서는 Noto Sans KR로 폴백합니다.

### 스케일

| 이름 | 크기 | 굵기 | 용도 |
|------|------|------|------|
| `text-xs` | 11px | 400 | 배지, 메타 정보 |
| `text-sm` | 13px | 400 | 보조 텍스트, 레이블 |
| `text-base` | 14px | 400 | 기본 본문 |
| `text-md` | 16px | 400 | 카드 제목, 입력 필드 |
| `text-lg` | 20px | 500 | 섹션 헤더 |
| `text-xl` | 24px | 400 | 페이지 제목 (예: 연월 표시) |
| `text-2xl` | 32px | 300 | 날짜 숫자 강조 |

### 줄 간격

- 본문 텍스트: `line-height: 1.5`
- 제목: `line-height: 1.25`

---

## 4. 간격 (Spacing)

8px 기반 그리드를 사용합니다.

| 토큰 | 값 | 용도 |
|------|----|------|
| `--space-1` | 4px | 아이콘 내부 간격 |
| `--space-2` | 8px | 요소 간 최소 간격 |
| `--space-3` | 12px | 컴포넌트 내부 패딩 |
| `--space-4` | 16px | 카드 패딩, 섹션 간격 |
| `--space-5` | 20px | 패널 패딩 |
| `--space-6` | 24px | 섹션 간 여백 |
| `--space-8` | 32px | 페이지 상단 여백 |

---

## 5. 보더 & 그림자

### 보더 반경

| 토큰 | 값 | 용도 |
|------|----|------|
| `--radius-sm` | 4px | 입력 필드, 배지 |
| `--radius-md` | 8px | 카드, 드롭다운 |
| `--radius-lg` | 12px | 모달, 패널 |
| `--radius-full` | 9999px | Pill 버튼 (예: "오늘" 버튼), 아바타 |

### 그림자

다크 테마에서는 그림자 대신 `border`와 배경색 차이로 계층을 표현합니다.  
팝업, 모달처럼 레이어 위에 떠 있는 요소에만 그림자를 사용합니다.

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.5);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.6);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.7);
```

---

## 6. 컴포넌트

### 6-1. Button

**Variant별 스타일:**

| Variant | 배경 | 텍스트 | 테두리 | 용도 |
|---------|------|--------|--------|------|
| `primary` | `--color-primary` | 흰색 | 없음 | 주요 액션 (저장, 추가) |
| `secondary` | 투명 | `--color-text-primary` | `--color-border` | 보조 액션 (취소) |
| `ghost` | 투명 | `--color-text-secondary` | 없음 | 아이콘 버튼, 네비게이션 |
| `danger` | 투명 | `--color-danger` | `--color-danger` | 삭제 확인 |

**상태:**

```css
/* Primary */
.btn-primary {
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-full);   /* pill shape */
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover { background: var(--color-primary-hover); }
.btn-primary:disabled {
  background: var(--color-surface-raised);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

/* Secondary */
.btn-secondary {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 7px 20px;
}
.btn-secondary:hover { background: var(--color-surface-raised); }
```

**로딩 상태:** 텍스트 대신 스피너 표시, 버튼 비활성화

---

### 6-2. Input

```css
.input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-size: 14px;
  padding: 10px 14px;
  width: 100%;
  outline: none;
  transition: border-color 0.15s;
}
.input:focus { border-color: var(--color-primary); }
.input.error { border-color: var(--color-danger); }
.input::placeholder { color: var(--color-text-disabled); }
```

**에러 메시지:** 인풋 하단에 `text-sm`, `--color-danger` 색상으로 표시합니다.

---

### 6-3. 체크박스

완료 여부 토글에 사용합니다.

```css
/* 미완료 */
.checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
}

/* 완료 */
.checkbox.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
  /* 체크 아이콘 (흰색) */
}
```

---

### 6-4. Card (할일 카드)

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}
.card:hover { background: var(--color-surface-raised); }

/* 완료된 할일 */
.card.completed {
  opacity: 0.6;
}
.card.completed .card-title {
  text-decoration: line-through;
  color: var(--color-text-secondary);
}
```

---

### 6-5. Modal

```css
/* 오버레이 */
.modal-overlay {
  background: rgba(0, 0, 0, 0.6);
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

/* 패널 */
.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-6);
  min-width: 400px;
  max-width: 560px;
  width: 100%;
}
```

닫기: ESC 키 + 오버레이 클릭 시 닫힙니다.

---

### 6-6. Toast

화면 우하단에 표시합니다. 자동으로 3초 후 사라집니다.

| 타입 | 왼쪽 인디케이터 색상 | 아이콘 |
|------|---------------------|--------|
| `success` | `--color-success` | ✓ |
| `error` | `--color-danger` | ✕ |
| `info` | `--color-primary` | ℹ |

```css
.toast {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-left: 4px solid <타입별 색상>;
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-text-primary);
  box-shadow: var(--shadow-md);
  min-width: 280px;
  max-width: 380px;
}
```

---

### 6-7. Badge / 카테고리 태그

```css
.badge {
  background: var(--color-primary-surface);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  padding: 2px 10px;
  display: inline-block;
}
```

---

### 6-8. Divider (구분선)

```css
.divider {
  border: none;
  border-top: 1px solid var(--color-border);
}
```

---

## 7. 레이아웃

### 전체 구조

```
+--------------------+----------------------------------+
|   사이드바 (260px) |       메인 콘텐츠 영역           |
|                    |                                  |
|  - 로고            |  상단 헤더 (필터바, 제목)        |
|  - 네비게이션 메뉴 |  ------------------------------- |
|  - 카테고리 목록   |  콘텐츠 (카드 목록, 폼 등)       |
|                    |                                  |
+--------------------+----------------------------------+
```

### 사이드바

- 너비: `260px` (고정)
- 배경: `--color-surface`
- 경계: 오른쪽 `border-right: 1px solid var(--color-border)`

### 메인 콘텐츠

- 최소 여백: 좌우 `24px`, 상 `24px`
- 최대 너비: 필요에 따라 `900px` 내외로 제한 (중앙 정렬)

### 반응형

| 브레이크포인트 | 동작 |
|---------------|------|
| `≥ 1024px` | 사이드바 고정 표시 |
| `< 1024px` | 사이드바 숨김, 햄버거 메뉴로 열기 |
| `< 480px` | 단일 열 레이아웃, 모달 풀스크린 |

---

## 8. 아이콘

Google Material Icons (outlined 스타일) 또는 동등한 라이브러리를 사용합니다.

- 크기: `20px` (기본), `24px` (네비게이션), `18px` (인라인)
- 색상: 아이콘은 기본적으로 `--color-text-secondary`. 활성 상태는 `--color-primary`.

---

## 9. 상태별 시각 처리

### 할일 완료 상태

- 체크박스: 파란색 채움
- 카드 제목: `line-through` + `--color-text-secondary`
- 카드 전체: `opacity: 0.6`

### 기본 카테고리 (수정/삭제 불가)

- 수정/삭제 버튼: `display: none` 또는 `disabled` + `--color-text-disabled`
- 배지에 "기본" 레이블 추가 가능

### 로딩 상태

- 목록: 스켈레톤 UI (동일한 카드 형태의 shimmer 애니메이션)
- 버튼: 스피너 + 비활성화

### 빈 목록

- 중앙 정렬 일러스트 또는 텍스트
- `--color-text-secondary`, `text-md`
- 예: "등록된 할일이 없습니다."

---

## 10. 애니메이션

과도한 애니메이션은 사용하지 않습니다. 트랜지션은 빠르고 절제되게 적용합니다.

| 용도 | duration | easing |
|------|----------|--------|
| 색상/배경 변화 (호버) | `150ms` | `ease` |
| 모달 열기/닫기 | `200ms` | `ease-out` |
| 토스트 진입 | `250ms` | `ease-out` |
| 스켈레톤 shimmer | `1.5s` | `linear` (반복) |

```css
/* 호버 기본 트랜지션 */
transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
```

`prefers-reduced-motion` 미디어 쿼리를 존중합니다.

```css
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
```
