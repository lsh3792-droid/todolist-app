-- ============================================================
-- TodolistApp Database Schema
-- PostgreSQL 17
-- 참조: docs/6-erd.md, docs/1-domain-definition.md
-- ============================================================

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE users (
    id          UUID         NOT NULL DEFAULT gen_random_uuid(),
    email       VARCHAR(254) NOT NULL,
    password    VARCHAR(255) NOT NULL,  -- bcrypt 해시 저장
    name        VARCHAR(50)  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users        PRIMARY KEY (id),
    CONSTRAINT uq_users_email  UNIQUE (email)   -- BR-3.1.1: 이메일 시스템 전체 고유
);

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE categories (
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id     UUID,                           -- NULL = 기본 카테고리 (업무·개인·기타)
    name        VARCHAR(50) NOT NULL,
    is_default  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_categories      PRIMARY KEY (id),
    CONSTRAINT fk_categories_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE  -- 회원 탈퇴 시 사용자 정의 카테고리 CASCADE 삭제
);

-- 카테고리명 UNIQUE 제약: user_id NULL 여부에 따라 분리 적용
-- BR-3.3.2: 사용자 정의 카테고리는 동일 사용자 내 중복 불가
CREATE UNIQUE INDEX uq_categories_user_name
    ON categories (user_id, name)
    WHERE user_id IS NOT NULL;

-- 기본 카테고리는 전역 중복 불가
CREATE UNIQUE INDEX uq_categories_default_name
    ON categories (name)
    WHERE user_id IS NULL;

-- ============================================================
-- TABLE: todos
-- ============================================================
CREATE TABLE todos (
    id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL,
    category_id  UUID         NOT NULL,
    title        VARCHAR(200) NOT NULL,
    description  VARCHAR(2000),               -- NULL 허용 (선택 입력)
    start_date   DATE         NOT NULL,
    due_date     DATE         NOT NULL,
    is_completed BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_todos          PRIMARY KEY (id),
    CONSTRAINT fk_todos_user     FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,         -- 회원 탈퇴 시 할일 CASCADE 삭제
    CONSTRAINT fk_todos_category FOREIGN KEY (category_id)
        REFERENCES categories(id) ON DELETE RESTRICT,  -- BR-3.3.3: 할일 있는 카테고리 삭제 불가
    CONSTRAINT chk_todos_due_date CHECK (due_date >= start_date)  -- BR-3.2.4
);

-- ============================================================
-- FUNCTION & TRIGGER: updated_at 자동 갱신
-- PostgreSQL은 ON UPDATE CURRENT_TIMESTAMP가 없으므로 트리거 사용
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- INDEXES: 주요 필터링 쿼리 최적화
-- ============================================================

-- todos: UC-08 필터링 쿼리 (user_id 기준 데이터 격리 필수)
CREATE INDEX idx_todos_user_id        ON todos (user_id);
CREATE INDEX idx_todos_category_id    ON todos (category_id);
CREATE INDEX idx_todos_user_completed ON todos (user_id, is_completed);   -- isCompleted 필터
CREATE INDEX idx_todos_user_due_date  ON todos (user_id, due_date);       -- dueDateFrom·dueDateTo 필터

-- categories: 목록 조회 최적화
CREATE INDEX idx_categories_user_id   ON categories (user_id);

-- ============================================================
-- SEED: 기본 카테고리
-- 서버 기동 시 1회 실행 (이미 존재하면 SKIP)
-- user_id = NULL, is_default = true
-- ============================================================
INSERT INTO categories (name, is_default)
VALUES
    ('업무', TRUE),
    ('개인', TRUE),
    ('기타', TRUE)
ON CONFLICT DO NOTHING;
