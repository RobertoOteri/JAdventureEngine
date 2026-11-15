package com.jadventure.backend.service.precondition;

import com.jadventure.backend.dto.action.PreconditionDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.PreconditionType;
import com.jadventure.backend.service.effect.AppendInputEffectHandler;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@Log4j2
public class InputEqualsChecker implements PreconditionChecker{

    @Override
    public PreconditionType type() {
        return PreconditionType.INPUT_EQUALS;
    }

    @Override
    public boolean isSatisfied(GameStateDto gameStateDto, PreconditionDto precondition){
        return false;
    }

    @Override
    public boolean isSatisfied(GameStateDto state, PreconditionDto precondition, String input) {
        String candidate = StringUtils.hasText(input) ? input : consumeTypedInput(state);
        log.debug("Executing INPUT_EQUALS check with input: {}", candidate);

        if (candidate == null || precondition.getExpectedValue() == null) {
            log.debug("Executed INPUT_EQUALS check: input or expected value missing, result: false");
            return false;
        }
        boolean satisfied = precondition.getExpectedValue().equalsIgnoreCase(candidate);
        log.debug("Executed INPUT_EQUALS check: result: {}", satisfied);
        return satisfied;
    }

    /** Prende la combinazione composta con i tasti (APPEND_INPUT) e la azzera: giusta o sbagliata, si riparte da capo. */
    private String consumeTypedInput(GameStateDto state) {
        if (state.getAdventureFlags() == null) {
            return null;
        }
        return state.getAdventureFlags().remove(AppendInputEffectHandler.TYPED_INPUT_FLAG);
    }
}
