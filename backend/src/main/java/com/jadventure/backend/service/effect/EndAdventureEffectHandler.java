package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import org.springframework.stereotype.Component;

@Component
public class EndAdventureEffectHandler implements EffectHandler {

    @Override
    public EffectType type() {
        return EffectType.END_ADVENTURE;
    }

    @Override
    public boolean requiresValue() {
        return false;
    }

    @Override
    public void apply(String adventureCode, GameStateDto state, String value) {
        state.setCompleted(true);
    }
}