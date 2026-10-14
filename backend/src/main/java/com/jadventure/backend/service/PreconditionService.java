package com.jadventure.backend.service;

import com.jadventure.backend.model.Action;
import com.jadventure.backend.model.GameSave;
import com.jadventure.backend.model.Precondition;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class PreconditionService {

    public Optional<String> validatePreconditions(GameSave save, Action action) {
        List<Precondition> preconditions = action.getPreconditions();
        if (preconditions == null || preconditions.isEmpty()) {
            return Optional.empty();
        }

        for (Precondition precondition : preconditions) {
            if (!isSatisfied(save, precondition)) {
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

    public boolean isSatisfied(GameSave save, Precondition precondition) {
        if (precondition == null || precondition.getType() == null) {
            return false;
        }

        String key = precondition.getRequiredKey();

        return switch (precondition.getType()) {
            case HAS_ITEM ->
                    save.getInventory() != null && save.getInventory().contains(key);

            case DOES_NOT_HAVE_ITEM ->
                    save.getInventory() == null || !save.getInventory().contains(key);

            case FLAG_EQUALS -> {
                String val = (save.getAdventureFlags() != null) ? save.getAdventureFlags().get(key) : null;
                yield Objects.equals(val, precondition.getExpectedValue());
            }
        };
    }
}