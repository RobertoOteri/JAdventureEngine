package com.jadventure.backend.service.precondition;

import com.jadventure.backend.dto.action.PreconditionDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.PreconditionType;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

@Component
@Log4j2
public class HasItemChecker implements PreconditionChecker {

    @Override
    public PreconditionType type() {
        return PreconditionType.HAS_ITEM;
    }

    @Override
    public boolean isSatisfied(GameStateDto state, PreconditionDto precondition) {
        log.debug("Executing HAS_ITEM check with requiredKey: {}", precondition.getRequiredKey());
        boolean satisfied = state.getInventory().stream()
                .anyMatch(item -> item.getCode().equals(precondition.getRequiredKey()));
        log.debug("Executed HAS_ITEM check for item {}: {}", precondition.getRequiredKey(), satisfied);
        return satisfied;
    }
}