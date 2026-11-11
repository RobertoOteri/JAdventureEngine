CREATE TABLE IF NOT EXISTS user_favorites (
    user_id BIGINT NOT NULL,
    adventure_code VARCHAR(100) NOT NULL,

    CONSTRAINT pk_user_favorites PRIMARY KEY (user_id, adventure_code),
    CONSTRAINT fk_user_favorites_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_adventure_code ON user_favorites (adventure_code);