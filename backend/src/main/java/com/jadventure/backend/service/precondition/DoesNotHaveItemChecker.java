package com.jadventure.backend.service.precondition;

import com.jadventure.backend.dto.action.PreconditionDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.PreconditionType;
import org.springframework.stereotype.Component;

@Component
public class DoesNotHaveItemChecker implements PreconditionChecker {

    @Override
    public PreconditionType type() {
        return PreconditionType.DOES_NOT_HAVE_ITEM;
    }

    @Override
    public boolean isSatisfied(GameStateDto state, PreconditionDto precondition) {
        return state.getInventory().stream()
                .noneMatch(item -> item.getCode().equals(precondition.getRequiredKey()));
    }
}