package com.jadventure.backend.service.precondition;

import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.Precondition;
import com.jadventure.backend.model.enums.PreconditionType;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class FlagEqualsChecker implements PreconditionChecker {

    @Override
    public PreconditionType type() {
        return PreconditionType.FLAG_EQUALS;
    }

    @Override
    public boolean isSatisfied(GameStateDto state, Precondition precondition) {
        String current = state.getAdventureFlags().get(precondition.getRequiredKey());
        return Objects.equals(current, precondition.getExpectedValue());
    }
}