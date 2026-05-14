-- Migration 002: Create categories table
-- 의존성: 001-create-users-table.sql

CREATE TABLE categories (
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id     UUID,
    name        VARCHAR(50) NOT NULL,
    is_default  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_categories      PRIMARY KEY (id),
    CONSTRAINT fk_categories_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX uq_categories_user_name
    ON categories (user_id, name)
    WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX uq_categories_default_name
    ON categories (name)
    WHERE user_id IS NULL;

CREATE INDEX idx_categories_user_id ON categories (user_id);
