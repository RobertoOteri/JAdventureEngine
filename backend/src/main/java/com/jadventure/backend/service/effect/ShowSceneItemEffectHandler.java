package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class ShowSceneItemEffectHandler implements EffectHandler {

    @Override
    public EffectType type() {
        return EffectType.SHOW_SCENE_ITEM;
    }

    @Override
    public void apply(Long adventureId, GameStateDto state, GameEffectDto effect) {
        log.info("Executing SHOW_SCENE_ITEM effect with adventureId: {}, effect: {}", adventureId, effect);
        state.getVisibleItemCodes().add(effect.getTargetValue());
        log.info("Executed SHOW_SCENE_ITEM effect: item {} shown", effect.getTargetValue());
    }
}