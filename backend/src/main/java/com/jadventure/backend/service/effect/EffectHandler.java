package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.GameEffect;
import com.jadventure.backend.model.enums.EffectType;

public interface EffectHandler {

    EffectType type();

    void apply(Long adventureId, GameStateDto state, GameEffectDto effect);
}
