package com.jadventure.backend.service.precondition;

import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.Precondition;
import com.jadventure.backend.model.enums.PreconditionType;

public interface PreconditionChecker {

    PreconditionType type();

    boolean isSatisfied(GameStateDto state, Precondition precondition);
}