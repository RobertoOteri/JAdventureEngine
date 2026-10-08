CREATE SEQUENCE IF NOT EXISTS users_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS graphic_adventure_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS scenes_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS items_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS action_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS precondition_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS game_effect_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS inventory_item_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS game_save_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY DEFAULT nextval('users_seq'),
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS graphic_adventures (
    id BIGINT PRIMARY KEY DEFAULT nextval('graphic_adventure_seq'),
    code VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
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

CREATE TABLE IF NOT EXISTS scenes (
    id BIGINT PRIMARY KEY DEFAULT nextval('scenes_seq'),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    background_image_url VARCHAR(255) NOT NULL,
    graphic_adventure_id BIGINT NOT NULL,
    CONSTRAINT uk_scene_adventure_code UNIQUE (graphic_adventure_id, code),
    CONSTRAINT fk_scene_adventure FOREIGN KEY (graphic_adventure_id) REFERENCES graphic_adventures (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGINT PRIMARY KEY DEFAULT nextval('inventory_item_seq'),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    image_url VARCHAR(255) NOT NULL,
    graphic_adventure_id BIGINT NOT NULL,
    CONSTRAINT uk_inventory_item_adventure_code UNIQUE (graphic_adventure_id, code),
    CONSTRAINT fk_inventory_item_adventure FOREIGN KEY (graphic_adventure_id) REFERENCES graphic_adventures (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS items (
    id BIGINT PRIMARY KEY DEFAULT nextval('items_seq'),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    pos_x INTEGER,
    pos_y INTEGER,
    points VARCHAR(1000) NOT NULL,
    width INTEGER,
    height INTEGER,
    initially_visible BOOLEAN NOT NULL DEFAULT TRUE,
    scene_id BIGINT NOT NULL,
    inventory_item_id BIGINT,
    CONSTRAINT uk_item_scene_code UNIQUE (scene_id, code),
    CONSTRAINT uk_item_inventory_item UNIQUE (inventory_item_id),
    CONSTRAINT fk_item_scene FOREIGN KEY (scene_id) REFERENCES scenes (id) ON DELETE CASCADE,
    CONSTRAINT fk_item_inventory_item FOREIGN KEY (inventory_item_id) REFERENCES inventory_items (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS actions (
    id BIGINT PRIMARY KEY DEFAULT nextval('action_seq'),
    code VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    success_message TEXT,
    default_failure_message TEXT,
    item_id BIGINT NOT NULL,
    CONSTRAINT fk_action_item FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS preconditions (
    id BIGINT PRIMARY KEY DEFAULT nextval('precondition_seq'),
    type VARCHAR(50) NOT NULL,
    required_key VARCHAR(255) NOT NULL,
    expected_value VARCHAR(255),
    failure_message TEXT,
    action_id BIGINT NOT NULL,
    CONSTRAINT fk_precondition_action FOREIGN KEY (action_id) REFERENCES actions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_effects (
    id BIGINT PRIMARY KEY DEFAULT nextval('game_effect_seq'),
    type VARCHAR(50) NOT NULL,
    target_value VARCHAR(255),
    action_id BIGINT NOT NULL,
    CONSTRAINT fk_game_effect_action FOREIGN KEY (action_id) REFERENCES actions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_saves (
    id BIGINT PRIMARY KEY DEFAULT nextval('game_save_seq'),
    code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    graphic_adventure_id BIGINT NOT NULL,
    current_scene_code VARCHAR(255) NOT NULL,
    saved_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_game_save_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_game_save_adventure FOREIGN KEY (graphic_adventure_id) REFERENCES graphic_adventures (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_save_inventory (
    game_save_id BIGINT NOT NULL,
    item_code VARCHAR(255) NOT NULL,
    CONSTRAINT fk_gsi_game_save FOREIGN KEY (game_save_id) REFERENCES game_saves (id) ON DELETE CASCADE,
    CONSTRAINT pk_game_save_inventory PRIMARY KEY (game_save_id, item_code)
);

CREATE TABLE IF NOT EXISTS game_save_world_flags (
    game_save_id BIGINT NOT NULL,
    flag_key VARCHAR(255) NOT NULL,
    flag_value VARCHAR(255),
    CONSTRAINT fk_gswf_game_save FOREIGN KEY (game_save_id) REFERENCES game_saves (id) ON DELETE CASCADE,
    CONSTRAINT pk_game_save_world_flags PRIMARY KEY (game_save_id, flag_key)
);

CREATE TABLE IF NOT EXISTS game_save_scene_items (
    game_save_id BIGINT NOT NULL,
    item_code VARCHAR(255) NOT NULL,
    CONSTRAINT fk_gssi_game_save FOREIGN KEY (game_save_id) REFERENCES game_saves (id) ON DELETE CASCADE,
    CONSTRAINT pk_game_save_scene_items PRIMARY KEY (game_save_id, item_code)
);


CREATE INDEX IF NOT EXISTS idx_graphic_adventures_author_id ON graphic_adventures (author_id);
CREATE INDEX IF NOT EXISTS idx_scenes_adventure_id ON scenes (graphic_adventure_id);
CREATE INDEX IF NOT EXISTS idx_items_scene_id ON items (scene_id);
CREATE INDEX IF NOT EXISTS idx_actions_item_id ON actions (item_id);
CREATE INDEX IF NOT EXISTS idx_preconditions_action_id ON preconditions (action_id);
CREATE INDEX IF NOT EXISTS idx_game_effects_action_id ON game_effects (action_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_adventure_id ON inventory_items (graphic_adventure_id);
CREATE INDEX IF NOT EXISTS idx_game_saves_user_adv_date ON game_saves (user_id, graphic_adventure_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_saves_code_user ON game_saves (code, user_id);