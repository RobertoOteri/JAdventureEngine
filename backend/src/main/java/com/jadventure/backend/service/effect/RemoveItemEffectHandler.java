package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class RemoveItemEffectHandler implements EffectHandler {

    @Override
    public EffectType type() {
        return EffectType.REMOVE_ITEM;
    }

    @Override
    public void apply(Long adventureId, GameStateDto state, GameEffectDto effect) {
        log.info("Executing REMOVE_ITEM effect with adventureId: {}, effect: {}", adventureId, effect);
        boolean removed = state.getInventory().removeIf(item -> item.getCode().equals(effect.getTargetValue()));
        log.info("Executed REMOVE_ITEM effect: item {} removed: {}", effect.getTargetValue(), removed);
    }
}
