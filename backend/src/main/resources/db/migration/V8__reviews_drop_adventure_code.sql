ALTER TABLE reviews DROP COLUMN IF EXISTS adventure_code;

CREATE INDEX IF NOT EXISTS idx_reviews_adventure_id ON reviews (graphic_adventure_id);