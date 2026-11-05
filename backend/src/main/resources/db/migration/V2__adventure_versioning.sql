ALTER TABLE graphic_adventures ADD COLUMN version_number INTEGER NOT NULL DEFAULT 1;
ALTER TABLE graphic_adventures ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'DRAFT';
ALTER TABLE graphic_adventures ADD COLUMN published_at TIMESTAMP WITHOUT TIME ZONE;

ALTER TABLE graphic_adventures
    ADD CONSTRAINT chk_graphic_adventures_status CHECK (status IN ('DRAFT', 'PUBLISHED'));

ALTER TABLE graphic_adventures DROP CONSTRAINT uq_graphic_adventures_code;
ALTER TABLE graphic_adventures DROP CONSTRAINT uq_graphic_adventures_title;

ALTER TABLE graphic_adventures
    ADD CONSTRAINT uq_graphic_adventures_code_version UNIQUE (code, version_number);

CREATE UNIQUE INDEX uq_graphic_adventures_one_draft
    ON graphic_adventures (code) WHERE status = 'DRAFT';