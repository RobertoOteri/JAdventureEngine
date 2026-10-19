package com.jadventure.backend.service.precondition;

import com.jadventure.backend.dto.action.PreconditionDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.PreconditionType;
import org.springframework.stereotype.Component;

@Component
public class FlagEqualsChecker implements PreconditionChecker {

    @Override
    public PreconditionType type() {
        return PreconditionType.FLAG_EQUALS;
    }

    @Override
    public boolean isSatisfied(GameStateDto state, PreconditionDto precondition) {
        boolean currentValue = state.getAdventureFlags().getOrDefault(precondition.getRequiredKey(), false);
        return currentValue == precondition.isExpectedValue();
    }
}