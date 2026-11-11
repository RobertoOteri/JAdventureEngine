CREATE SEQUENCE IF NOT EXISTS review_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS reviews (
                                       id BIGINT NOT NULL DEFAULT nextval('review_seq'),
    user_id BIGINT NOT NULL,
    graphic_adventure_id BIGINT NOT NULL,
    adventure_code VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    CONSTRAINT pk_reviews PRIMARY KEY (id),
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_adventure FOREIGN KEY (graphic_adventure_id) REFERENCES graphic_adventures (id) ON DELETE CASCADE,
    CONSTRAINT uq_reviews_user_adventure_code UNIQUE (user_id, adventure_code),
    CONSTRAINT ck_reviews_rating CHECK (rating BETWEEN 1 AND 5)
    );

CREATE INDEX IF NOT EXISTS idx_reviews_adventure_code ON reviews (adventure_code);