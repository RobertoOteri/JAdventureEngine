package com.jadventure.backend.service;

import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.model.Action;
import com.jadventure.backend.model.Precondition;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PreconditionService {

    public Optional<String> validatePreconditions(GameStateDto state, Action action) {
        List<Precondition> preconditions = action.getPreconditions();
        if (preconditions == null || preconditions.isEmpty()) {
            return Optional.empty();
        }

        for (Precondition precondition : preconditions) {
            if (!isSatisfied(state, precondition)) {
                if (precondition.getFailureMessage() != null && !precondition.getFailureMessage().isBlank()) {
                    return Optional.of(precondition.getFailureMessage());
                }
                if (action.getDefaultFailureMessage() != null && !action.getDefaultFailureMessage().isBlank()) {
                    return Optional.of(action.getDefaultFailureMessage());
                }
                return Optional.of("Non puoi compiere questa azione in questo momento.");
            }
        }

        return Optional.empty();
    }

    public boolean isSatisfied(GameStateDto state, Precondition precondition) {
        if (precondition == null || precondition.getType() == null || state == null) {
            return false;
        }

        Set<String> inventoryCodes = state.getInventory() == null
                ? new HashSet<>()
                : state.getInventory().stream()
                .map(InventoryItemDto::getCode)
                .collect(Collectors.toSet());

        Map<String, String> adventureFlags = state.getAdventureFlags();
        String key = precondition.getRequiredKey();

        return switch (precondition.getType()) {
            case HAS_ITEM ->
                    inventoryCodes.contains(key);

            case DOES_NOT_HAVE_ITEM ->
                    !inventoryCodes.contains(key);

            case FLAG_EQUALS -> {
                String val = (adventureFlags != null) ? adventureFlags.get(key) : null;
                yield Objects.equals(val, precondition.getExpectedValue());
            }
        };
    }
}