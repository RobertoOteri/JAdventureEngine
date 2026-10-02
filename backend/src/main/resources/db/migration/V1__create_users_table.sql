CREATE SEQUENCE IF NOT EXISTS users_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS graphic_adventure_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL DEFAULT nextval('users_seq'),
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS graphic_adventures (
    id BIGINT NOT NULL DEFAULT nextval('graphic_adventure_seq'),
    code VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    cover_image_url VARCHAR(500),
    initial_scene_code VARCHAR(100),
    author_id BIGINT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

    CONSTRAINT uq_graphic_adventures_code UNIQUE (code),
    CONSTRAINT uq_graphic_adventures_title UNIQUE (title),
    CONSTRAINT fk_graphic_adventures_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_graphic_adventures_code ON graphic_adventures(code);
CREATE INDEX IF NOT EXISTS idx_graphic_adventures_author_id ON graphic_adventures(author_id);