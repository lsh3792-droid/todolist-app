# E2E 통합 재테스트 결과 보고서

**작성일:** 2026-05-15  
**참조 문서:** docs/3-user-scenario.md  
**테스트 환경:** localhost:5173 (프론트엔드), localhost:3000 (백엔드)  
**테스트 도구:** Playwright MCP  
**뷰포트:** 1280×800 (이전 테스트: 845×775)  
**테스트 계정:** e2e_retest_20260515@test.com

---

## 이슈 개선 내용

### 이슈 1 — 사이드바 뷰포트 문제 ✅ 해결
- **원인:** Playwright MCP 기본 뷰포트(845×775)가 스타일 가이드 브레이크포인트(< 1024px) 미만이어서 사이드바가 숨겨지고 햄버거 메뉴가 활성화됨
- **개선:** 테스트 뷰포트를 1280×800으로 설정 → 사이드바 항상 고정 표시
- **효과:** 모든 페이지 이동을 사이드바 링크로 직접 수행 가능, 햄버거 메뉴 클릭 불필요
- **근거:** 스타일 가이드(`≥ 1024px` 사이드바 고정) 및 CSS(`@media (max-width: 1023px)`) 정상 동작 확인

### 이슈 2 — Zustand 메모리 저장 ✅ 설계 의도 확인, 코드 변경 없음
- **판정:** 명세서 명시 사항("Cookie·localStorage는 사용하지 않는다") — 변경 불가
- **개선:** 테스트 중 `browser_navigate`(풀 페이지 로드) 대신 사이드바 React Router 링크만 사용하여 불필요한 토큰 초기화 방지
- **효과:** 로그아웃 외 추가 로그인 없이 모든 테스트 연속 수행

---

## 재테스트 결과 요약

| UC | 기능 | 1차 결과 | 재테스트 결과 | 스크린샷 |
|---|---|---|---|---|
| UC-01 | 회원가입 | ✅ PASS | ✅ PASS | 01-register-success.png |
| UC-02 | 로그인 | ✅ PASS | ✅ PASS | 10-login-success.png |
| UC-03 | 사용자 정보 수정 | ✅ PASS | ✅ PASS | 08-name-updated.png |
| UC-04 | 할일 등록 | ✅ PASS | ✅ PASS | 02-todos-3items.png |
| UC-05 | 할일 수정 | ✅ PASS | ✅ PASS | 04-todo-edited.png |
| UC-06 | 할일 삭제 | ✅ PASS | ✅ PASS | 05-todo-deleted.png |
| UC-07 | 완료 처리 토글 | ✅ PASS | ✅ PASS | 03-filter-work-incomplete.png |
| UC-08 | 할일 목록 필터링 | ✅ PASS | ✅ PASS | 03-filter-work-incomplete.png |
| UC-09 | 카테고리 추가 | ✅ PASS | ✅ PASS | 06-category-added.png |
| UC-10 | 카테고리 삭제 | ✅ PASS | ✅ PASS | 07-category-renamed.png |
| UC-11 | 카테고리 수정 | ✅ PASS | ✅ PASS | 07-category-renamed.png |
| - | 로그아웃 | ✅ PASS | ✅ PASS | 09-logout.png |
| - | 회원 탈퇴 | ✅ PASS | ✅ PASS | 11-withdrawal-success.png |

**전체 결과: 13/13 PASS**  
**발견된 미해결 이슈: 없음**

---

## 1차 대비 개선된 점

| 항목 | 1차 테스트 | 재테스트 |
|---|---|---|
| 뷰포트 | 845×775 (모바일 레이아웃) | 1280×800 (데스크탑 레이아웃) |
| 사이드바 접근 | 매번 ☰ 클릭 필요 | 직접 링크 클릭 |
| 페이지 이동 방식 | `browser_navigate` + 사이드바 혼용 | 사이드바 링크만 사용 |
| 로그인 횟수 | 3회 (강제 재로그인 포함) | 2회 (회원가입 후 1회, 탈퇴 전 1회) |
| 테스트 안정성 | 뷰포트 관련 간헐적 오류 발생 | 오류 없이 전 구간 완주 |

---

## 스크린샷 목록 (screenshots-retest/)

| 파일명 | 내용 |
|---|---|
| 01-register-success.png | UC-01 회원가입 후 메인 화면 (사이드바 항상 표시 확인) |
| 02-todos-3items.png | UC-04 할일 3건 등록 |
| 03-filter-work-incomplete.png | UC-07/08 완료 토글 + 업무·미완료 AND 필터 |
| 04-todo-edited.png | UC-05 할일 수정 |
| 05-todo-deleted.png | UC-06 할일 삭제 |
| 06-category-added.png | UC-09 카테고리 추가 |
| 07-category-renamed.png | UC-11 카테고리 수정 |
| 08-name-updated.png | UC-03 이름 수정 |
| 09-logout.png | 로그아웃 |
| 10-login-success.png | UC-02 로그인 |
| 11-withdrawal-success.png | 회원 탈퇴 후 로그인 화면 |
