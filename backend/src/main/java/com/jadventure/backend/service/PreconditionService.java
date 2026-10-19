package com.jadventure.backend.service;

import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.Action;
import com.jadventure.backend.model.Precondition;
import com.jadventure.backend.model.enums.PreconditionType;
import com.jadventure.backend.service.precondition.PreconditionChecker;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PreconditionService {

    private final Map<PreconditionType, PreconditionChecker> checkers;

    public PreconditionService(List<PreconditionChecker> checkerList) {
        this.checkers = checkerList.stream()
                .collect(Collectors.toMap(PreconditionChecker::type, Function.identity()));

        for (PreconditionType type : PreconditionType.values()) {
            if (!checkers.containsKey(type)) {
                throw new IllegalStateException("Manca il checker per la precondizione " + type);
            }
        }
    }

    public Optional<String> validatePreconditions(GameStateDto state, Action action) {
        return action.getPreconditions().stream()
                .filter(precondition -> !isSatisfied(state, precondition))
                .findFirst()
                .map(precondition -> failureMessage(precondition, action));
    }

    public boolean isSatisfied(GameStateDto state, Precondition precondition) {
        if (state == null || precondition == null || precondition.getType() == null) {
            return false;
        }
        return checkers.get(precondition.getType()).isSatisfied(state, precondition);
    }

    private String failureMessage(Precondition precondition, Action action) {
        if (StringUtils.hasText(precondition.getFailureMessage())) {
            return precondition.getFailureMessage();
        }
        if (StringUtils.hasText(action.getDefaultFailureMessage())) {
            return action.getDefaultFailureMessage();
        }
        return "Non puoi compiere questa azione in questo momento.";
    }
}