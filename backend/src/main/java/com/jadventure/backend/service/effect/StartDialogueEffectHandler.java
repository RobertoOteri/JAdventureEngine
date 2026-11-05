package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class StartDialogueEffectHandler implements EffectHandler {

    @Override
    public EffectType type() {
        return EffectType.START_DIALOGUE;
    }

    @Override
    public void apply(Long adventureId, GameStateDto state, GameEffectDto effect) {
        if (StringUtils.hasText(effect.getTargetValue())) {
            state.setCurrentDialogueNodeCode(effect.getTargetValue());
        }
    }
}
