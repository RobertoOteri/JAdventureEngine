package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class ClearInputEffectHandler implements EffectHandler {

    @Override
    public EffectType type() {
        return EffectType.CLEAR_INPUT;
    }

    @Override
    public void apply(Long adventureId, GameStateDto state, GameEffectDto effect) {
        log.info("Executing CLEAR_INPUT effect with adventureId: {}, effect: {}", adventureId, effect);
        if (state.getAdventureFlags() == null) {
            log.info("Executed CLEAR_INPUT effect: no flags, nothing to clear");
            return;
        }

        state.getAdventureFlags().remove(AppendInputEffectHandler.TYPED_INPUT_FLAG);
        log.info("Executed CLEAR_INPUT effect: typed input cleared");
    }
}