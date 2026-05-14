-- Migration 003: Create todos table
-- 의존성: 001-create-users-table.sql, 002-create-categories-table.sql

CREATE TABLE todos (
    id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL,
    category_id  UUID         NOT NULL,
    title        VARCHAR(200) NOT NULL,
    description  VARCHAR(2000),
    start_date   DATE         NOT NULL,
    due_date     DATE         NOT NULL,
    is_completed BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_todos          PRIMARY KEY (id),
    CONSTRAINT fk_todos_user     FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_todos_category FOREIGN KEY (category_id)
        REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT chk_todos_due_date CHECK (due_date >= start_date)
);

CREATE INDEX idx_todos_user_id        ON todos (user_id);
CREATE INDEX idx_todos_category_id    ON todos (category_id);
CREATE INDEX idx_todos_user_completed ON todos (user_id, is_completed);
CREATE INDEX idx_todos_user_due_date  ON todos (user_id, due_date);

CREATE TRIGGER trg_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
