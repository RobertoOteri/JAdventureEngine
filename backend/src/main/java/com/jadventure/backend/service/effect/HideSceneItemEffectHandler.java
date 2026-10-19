package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import org.springframework.stereotype.Component;

@Component
public class HideSceneItemEffectHandler implements EffectHandler {

    @Override
    public EffectType type() {
        return EffectType.HIDE_SCENE_ITEM;
    }

    @Override
    public void apply(String adventureCode, GameStateDto state, String itemCode) {
        state.getVisibleItemCodes().remove(itemCode);
    }
}