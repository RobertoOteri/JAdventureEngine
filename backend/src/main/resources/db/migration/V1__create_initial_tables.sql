CREATE SEQUENCE IF NOT EXISTS users_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS graphic_adventure_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS scenes_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS items_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS action_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS precondition_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS game_effect_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS game_save_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS game_state_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS leaderboard_entry_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS dialogue_node_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS dialogue_choice_seq START WITH 1 INCREMENT BY 1;

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

CREATE TABLE IF NOT EXISTS items (
    id BIGINT PRIMARY KEY DEFAULT nextval('items_seq'),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    image_url VARCHAR(255),
    graphic_adventure_id BIGINT NOT NULL,
    scene_id BIGINT,
    pos_x INTEGER,
    pos_y INTEGER,
    points VARCHAR(1000),
    width INTEGER,
    height INTEGER,
    initially_visible BOOLEAN DEFAULT TRUE,

    CONSTRAINT uk_item_adventure_code UNIQUE (graphic_adventure_id, code),
    CONSTRAINT fk_item_adventure FOREIGN KEY (graphic_adventure_id) REFERENCES graphic_adventures (id) ON DELETE CASCADE,
    CONSTRAINT fk_item_scene FOREIGN KEY (scene_id) REFERENCES scenes (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dialogue_nodes (
    id BIGINT PRIMARY KEY DEFAULT nextval('dialogue_node_seq'),
    code VARCHAR(36) NOT NULL,
    text VARCHAR(3000),
    item_id BIGINT NOT NULL,

    CONSTRAINT uq_dialogue_nodes_code UNIQUE (code),
    CONSTRAINT fk_dialogue_node_item FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS dialogue_choices (
    id BIGINT PRIMARY KEY DEFAULT nextval('dialogue_choice_seq'),
    text VARCHAR(1000),
    source_node_id BIGINT NOT NULL,
    next_node_id BIGINT,

    CONSTRAINT fk_dialogue_choice_source FOREIGN KEY (source_node_id) REFERENCES dialogue_nodes (id) ON DELETE CASCADE,
    CONSTRAINT fk_dialogue_choice_next FOREIGN KEY (next_node_id) REFERENCES dialogue_nodes (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS actions (
    id BIGINT PRIMARY KEY DEFAULT nextval('action_seq'),
    code VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    target_item_code VARCHAR(50),
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
    pos_x INTEGER,
    pos_y INTEGER,
    width INTEGER,
    height INTEGER,
    font_family VARCHAR(100),
    font_size VARCHAR(50),
    color VARCHAR(20),
    action_id BIGINT,
    choice_id BIGINT,
    CONSTRAINT fk_precondition_action FOREIGN KEY (action_id) REFERENCES actions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_effects (
    id BIGINT PRIMARY KEY DEFAULT nextval('game_effect_seq'),
    type VARCHAR(50) NOT NULL,
    target_value VARCHAR(255),
    flag_value VARCHAR(255),
    action_id BIGINT,
    node_id BIGINT,
    choice_id BIGINT,
    CONSTRAINT fk_game_effect_action FOREIGN KEY (action_id) REFERENCES actions (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_states (
    id BIGINT PRIMARY KEY DEFAULT nextval('game_state_seq'),
    current_scene_code VARCHAR(255) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    play_time BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS game_saves (
    id BIGINT PRIMARY KEY DEFAULT nextval('game_save_seq'),
    code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    graphic_adventure_id BIGINT NOT NULL,
    game_state_id BIGINT NOT NULL,
    is_auto_save BOOLEAN NOT NULL DEFAULT FALSE,
    saved_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_game_save_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_game_save_adventure FOREIGN KEY (graphic_adventure_id) REFERENCES graphic_adventures(id) ON DELETE CASCADE,
    CONSTRAINT fk_game_save_state FOREIGN KEY (game_state_id) REFERENCES game_states(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_state_inventory (
    game_state_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    CONSTRAINT pk_game_state_inventory PRIMARY KEY (game_state_id, item_id),
    CONSTRAINT fk_gsi_game_state FOREIGN KEY (game_state_id) REFERENCES game_states (id) ON DELETE CASCADE,
    CONSTRAINT fk_gsi_item FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_state_world_flags (
    game_state_id BIGINT NOT NULL,
    flag_key VARCHAR(255) NOT NULL,
    flag_value VARCHAR(255),
    CONSTRAINT fk_gswf_game_state FOREIGN KEY (game_state_id) REFERENCES game_states (id) ON DELETE CASCADE,
    CONSTRAINT pk_game_state_world_flags PRIMARY KEY (game_state_id, flag_key)
);

CREATE TABLE IF NOT EXISTS game_state_scene_items (
    game_state_id BIGINT NOT NULL,
    item_code VARCHAR(255) NOT NULL,
    CONSTRAINT fk_gssi_game_state FOREIGN KEY (game_state_id) REFERENCES game_states (id) ON DELETE CASCADE,
    CONSTRAINT pk_game_state_scene_items PRIMARY KEY (game_state_id, item_code)
);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id BIGINT NOT NULL DEFAULT nextval('leaderboard_entry_seq'),
    user_id BIGINT NOT NULL,
    graphic_adventure_id BIGINT NOT NULL,
    play_time BIGINT NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    CONSTRAINT pk_leaderboard_entries PRIMARY KEY (id),
    CONSTRAINT fk_leaderboard_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_leaderboard_adventure FOREIGN KEY (graphic_adventure_id) REFERENCES graphic_adventures (id) ON DELETE CASCADE,
    CONSTRAINT uq_leaderboard_user_adventure UNIQUE (user_id, graphic_adventure_id)
);

CREATE INDEX IF NOT EXISTS idx_graphic_adventures_author_id ON graphic_adventures (author_id);
CREATE INDEX IF NOT EXISTS idx_scenes_adventure_id ON scenes (graphic_adventure_id);
CREATE INDEX IF NOT EXISTS idx_items_scene_id ON items (scene_id);
CREATE INDEX IF NOT EXISTS idx_items_adventure_id ON items (graphic_adventure_id);
CREATE INDEX IF NOT EXISTS idx_actions_item_id ON actions (item_id);
CREATE INDEX IF NOT EXISTS idx_preconditions_action_id ON preconditions (action_id);
CREATE INDEX IF NOT EXISTS idx_game_effects_action_id ON game_effects (action_id);
CREATE INDEX IF NOT EXISTS idx_dialogue_nodes_item_id ON dialogue_nodes (item_id);
CREATE INDEX IF NOT EXISTS idx_dialogue_choices_source_node_id ON dialogue_choices (source_node_id);
CREATE INDEX IF NOT EXISTS idx_dialogue_choices_next_node_id ON dialogue_choices (next_node_id);
CREATE INDEX IF NOT EXISTS idx_game_saves_user_adv_auto_date ON game_saves (user_id, graphic_adventure_id, is_auto_save, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_saves_code_user ON game_saves (code, user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_game_saves_one_auto ON game_saves (user_id, graphic_adventure_id) WHERE is_auto_save = TRUE;