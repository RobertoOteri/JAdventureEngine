ALTER TABLE actions DROP CONSTRAINT actions_code_key;
ALTER TABLE actions
    ADD CONSTRAINT uq_actions_item_code UNIQUE (item_id, code);

ALTER TABLE dialogue_nodes DROP CONSTRAINT uq_dialogue_nodes_code;
ALTER TABLE dialogue_nodes
    ADD CONSTRAINT uq_dialogue_nodes_item_code UNIQUE (item_id, code);