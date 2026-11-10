package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.HashMap;

@Component
@Log4j2
public class SetFlagEffectHandler implements EffectHandler {

    @Override
    public EffectType type() {
        return EffectType.SET_FLAG;
    }

    @Override
    public void apply(Long adventureId, GameStateDto state, GameEffectDto effect) {
        log.info("Executing SET_FLAG effect with adventureId: {}, effect: {}", adventureId, effect);
        if (state.getAdventureFlags() == null) {
            state.setAdventureFlags(new HashMap<>());
        }

        String key = effect.getTargetValue();
        String val = effect.getFlagValue();

        if (key != null) {
            state.getAdventureFlags().put(key, val);
        }
        log.info("Executed SET_FLAG effect: flag {} set to {}", key, val);
    }
}