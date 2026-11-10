package com.jadventure.backend.service.precondition;

import com.jadventure.backend.dto.action.PreconditionDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.PreconditionType;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

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
        log.debug("Executing INPUT_EQUALS check with input: {}", input);
        if(input == null || precondition.getExpectedValue() == null) {
            log.debug("Executed INPUT_EQUALS check: input or expected value missing, result: false");
            return false;
        }
        boolean satisfied = precondition.getExpectedValue().equalsIgnoreCase(input);
        log.debug("Executed INPUT_EQUALS check: result: {}", satisfied);
        return satisfied;
    }
}
