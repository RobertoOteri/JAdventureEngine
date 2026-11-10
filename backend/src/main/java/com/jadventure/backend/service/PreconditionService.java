package com.jadventure.backend.service;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.action.PreconditionDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.Action;
import com.jadventure.backend.model.Precondition;
import com.jadventure.backend.model.enums.PreconditionType;
import com.jadventure.backend.service.precondition.PreconditionChecker;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Log4j2
public class PreconditionService {

    private final Map<PreconditionType, PreconditionChecker> checkers;

    public PreconditionService(List<PreconditionChecker> checkerList) {
        this.checkers = checkerList.stream()
                .collect(Collectors.toMap(PreconditionChecker::type, Function.identity()));
    }

    public Optional<String> validatePreconditions(GameStateDto state, ActionDto action, String input) {
        log.info("Executing validatePreconditions for action {} with {} preconditions", action.getCode(), action.getPreconditions().size());
        Optional<String> failure = action.getPreconditions().stream()
                .filter(precondition -> !isSatisfied(state, precondition, input))
                .findFirst()
                .map(precondition -> failureMessage(precondition, action));
        log.info("Executed validatePreconditions for action {}: all satisfied: {}", action.getCode(), failure.isEmpty());
        return failure;
    }

    public boolean isSatisfied(GameStateDto state, PreconditionDto precondition, String input) {
        boolean satisfied = checkers.get(precondition.getType()).isSatisfied(state, precondition, input);
        log.debug("Executed isSatisfied for precondition of type {}: {}", precondition.getType(), satisfied);
        return satisfied;
    }

    private String failureMessage(PreconditionDto precondition, ActionDto action) {
        if (StringUtils.hasText(precondition.getFailureMessage())) {
            return precondition.getFailureMessage();
        }
        if (StringUtils.hasText(action.getDefaultFailureMessage())) {
            return action.getDefaultFailureMessage();
        }
        return "";
    }
}