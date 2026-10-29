package com.jadventure.backend.service.precondition;

import com.jadventure.backend.dto.action.PreconditionDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.PreconditionType;
import org.springframework.stereotype.Component;

@Component
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
        if(input == null || precondition.getExpectedValue() == null) {
            return false;
        }
        return precondition.getExpectedValue().equalsIgnoreCase(input);
    }
}
