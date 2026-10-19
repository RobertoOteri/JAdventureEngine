package com.jadventure.backend.service.precondition;

import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.dto.action.PreconditionDto;
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
    public boolean isSatisfied(GameStateDto state, PreconditionDto precondition) {
        if (state.getAdventureFlags() == null || precondition.getRequiredKey() == null) {
            return false;
        }

        String key = precondition.getRequiredKey();
        String expected = precondition.getExpectedValue();
        String current = state.getAdventureFlags().get(key);

        return Objects.equals(current, expected);
    }
}