package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@Log4j2
public class StartDialogueEffectHandler implements EffectHandler {

    @Override
    public EffectType type() {
        return EffectType.START_DIALOGUE;
    }

    @Override
    public void apply(Long adventureId, GameStateDto state, GameEffectDto effect) {
        log.info("Executing START_DIALOGUE effect with adventureId: {}, effect: {}", adventureId, effect);
        if (StringUtils.hasText(effect.getTargetValue())) {
            state.setCurrentDialogueNodeCode(effect.getTargetValue());
        }
        log.info("Executed START_DIALOGUE effect: current dialogue node is {}", state.getCurrentDialogueNodeCode());
    }
}
