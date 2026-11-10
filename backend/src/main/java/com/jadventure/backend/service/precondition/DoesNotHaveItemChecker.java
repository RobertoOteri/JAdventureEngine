package com.jadventure.backend.service.precondition;

import com.jadventure.backend.dto.action.PreconditionDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.PreconditionType;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class DoesNotHaveItemChecker implements PreconditionChecker {

    @Override
    public PreconditionType type() {
        return PreconditionType.DOES_NOT_HAVE_ITEM;
    }

    @Override
    public boolean isSatisfied(GameStateDto state, PreconditionDto precondition) {
        log.debug("Executing DOES_NOT_HAVE_ITEM check with requiredKey: {}", precondition.getRequiredKey());
        boolean satisfied = state.getInventory().stream()
                .noneMatch(item -> item.getCode().equals(precondition.getRequiredKey()));
        log.debug("Executed DOES_NOT_HAVE_ITEM check for item {}: {}", precondition.getRequiredKey(), satisfied);
        return satisfied;
    }
}