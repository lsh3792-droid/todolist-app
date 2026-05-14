-- Migration 001: Create users table
-- 의존성: 없음

CREATE TABLE users (
    id          UUID         NOT NULL DEFAULT gen_random_uuid(),
    email       VARCHAR(254) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    name        VARCHAR(50)  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users       PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

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
