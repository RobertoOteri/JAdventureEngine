package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import org.springframework.stereotype.Component;

@Component
public class RemoveItemEffectHandler implements EffectHandler {

    @Override
    public EffectType type() {
        return EffectType.REMOVE_ITEM;
    }

    @Override
    public void apply(String adventureCode, GameStateDto state, GameEffectDto effect) {
        state.getInventory().removeIf(item -> item.getCode().equals(effect.getTargetValue()));
    }
}
