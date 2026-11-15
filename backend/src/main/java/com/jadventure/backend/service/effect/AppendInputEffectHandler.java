package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.HashMap;

@Component
@Log4j2
public class AppendInputEffectHandler implements EffectHandler {

    /** Flag in cui si accumula quello che il giocatore compone con i tasti. */
    public static final String TYPED_INPUT_FLAG = "typed_input";

    /** Oltre questa lunghezza i tasti premuti vengono ignorati. */
    public static final int MAX_INPUT_LENGTH = 32;

    @Override
    public EffectType type() {
        return EffectType.APPEND_INPUT;
    }

    @Override
    public void apply(Long adventureId, GameStateDto state, GameEffectDto effect) {
        log.info("Executing APPEND_INPUT effect with adventureId: {}, effect: {}", adventureId, effect);
        String value = effect.getFlagValue();
        if (value == null || value.isEmpty()) {
            log.warn("Executed APPEND_INPUT effect: no value to append, nothing to do");
            return;
        }

        if (state.getAdventureFlags() == null) {
            state.setAdventureFlags(new HashMap<>());
        }

        String current = state.getAdventureFlags().getOrDefault(TYPED_INPUT_FLAG, "");
        if (current.length() + value.length() > MAX_INPUT_LENGTH) {
            log.info("Executed APPEND_INPUT effect: typed input already at max length, value ignored");
            return;
        }

        String updated = current + value;
        state.getAdventureFlags().put(TYPED_INPUT_FLAG, updated);
        log.info("Executed APPEND_INPUT effect: typed input is now '{}'", updated);
    }
}
