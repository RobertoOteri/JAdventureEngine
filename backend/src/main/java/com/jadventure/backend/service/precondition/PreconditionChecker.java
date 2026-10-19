package com.jadventure.backend.service.precondition;

import com.jadventure.backend.dto.action.PreconditionDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.PreconditionType;

public interface PreconditionChecker {

    PreconditionType type();

    boolean isSatisfied(GameStateDto state, PreconditionDto precondition);
}