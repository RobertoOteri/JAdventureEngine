package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import org.springframework.stereotype.Component;

import java.util.HashMap;

@Component
public class SetFlagEffectHandler implements EffectHandler {

    @Override
    public EffectType type() {
        return EffectType.SET_FLAG;
    }

    @Override
    public void apply(String adventureCode, GameStateDto state, GameEffectDto effect) {
        if (state.getAdventureFlags() == null) {
            state.setAdventureFlags(new HashMap<>());
        }

        String key = effect.getTargetValue();
        String val = effect.getFlagValue();

        if (key != null) {
            state.getAdventureFlags().put(key, val);
        }
    }
}