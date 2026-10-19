package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;

public interface EffectHandler {

    EffectType type();

    void apply(String adventureCode, GameStateDto state, String value);

    default boolean requiresValue() {
        return true;
    }
}
