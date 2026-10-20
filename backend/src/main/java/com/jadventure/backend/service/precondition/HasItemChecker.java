package com.jadventure.backend.service.precondition;

import com.jadventure.backend.dto.action.PreconditionDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.PreconditionType;
import org.springframework.stereotype.Component;

@Component
public class HasItemChecker implements PreconditionChecker {

    @Override
    public PreconditionType type() {
        return PreconditionType.HAS_ITEM;
    }

    @Override
    public boolean isSatisfied(GameStateDto state, PreconditionDto precondition) {
        return state.getInventory().stream()
                .anyMatch(item -> item.getCode().equals(precondition.getRequiredKey()));
    }
}