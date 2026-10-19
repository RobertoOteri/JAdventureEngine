package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import org.springframework.stereotype.Component;

@Component
public class SetFlagEffectHandler implements EffectHandler {

    @Override
    public EffectType type() {
        return EffectType.SET_FLAG;
    }

    @Override
    public void apply(String adventureCode, GameStateDto state, String rawFlag) {
        String[] parts = rawFlag.split("=", 2);
        String key = parts[0].trim();
        String value = parts.length > 1 ? parts[1].trim() : "true";
        state.getAdventureFlags().put(key, value);
    }
}
