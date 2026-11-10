package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class EndiDialogueEffectHandler implements EffectHandler {

    @Override
    public EffectType type(){
        return EffectType.END_DIALOGUE;
    }

    @Override
    public void apply(Long adventureId, GameStateDto state, GameEffectDto effect){
        log.info("Executing END_DIALOGUE effect with adventureId: {}, effect: {}", adventureId, effect);
        state.setCurrentDialogueNodeCode(null);
        log.info("Executed END_DIALOGUE effect: dialogue closed");
    }
}
