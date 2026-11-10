package com.jadventure.backend.service.precondition;

import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.dto.action.PreconditionDto;
import com.jadventure.backend.model.enums.PreconditionType;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
@Log4j2
public class FlagEqualsChecker implements PreconditionChecker {

    @Override
    public PreconditionType type() {
        return PreconditionType.FLAG_EQUALS;
    }

    @Override
    public boolean isSatisfied(GameStateDto state, PreconditionDto precondition) {
        log.debug("Executing FLAG_EQUALS check with requiredKey: {}", precondition.getRequiredKey());
        if (state.getAdventureFlags() == null || precondition.getRequiredKey() == null) {
            log.debug("Executed FLAG_EQUALS check: flags or required key missing, result: false");
            return false;
        }

        String key = precondition.getRequiredKey();
        String expected = precondition.getExpectedValue();
        String current = state.getAdventureFlags().get(key);

        boolean satisfied = Objects.equals(current, expected);
        log.debug("Executed FLAG_EQUALS check for flag {}: expected {}, current {}, result: {}", key, expected, current, satisfied);
        return satisfied;
    }
}