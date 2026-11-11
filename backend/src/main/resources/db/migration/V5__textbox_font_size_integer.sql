ALTER TABLE preconditions
    ALTER COLUMN font_size TYPE INTEGER
    USING substring(font_size FROM '^\d+')::INTEGER;