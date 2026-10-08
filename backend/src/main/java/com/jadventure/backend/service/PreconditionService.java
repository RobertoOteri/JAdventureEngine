package com.jadventure.backend.service;

import com.jadventure.backend.model.Action;
import com.jadventure.backend.model.GameSave;
import com.jadventure.backend.model.Precondition;
import com.jadventure.backend.model.enums.PreconditionType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class PreconditionService {

    public Optional<String> validatePreconditions(GameSave save, Action action) {
        List<Precondition> preconditions = action.getPreconditions();
        if(preconditions == null || preconditions.isEmpty()){
            return Optional.empty();
        }

        for(Precondition precondition : preconditions) {
            if(!isSatisfied(save, precondition)) {
                if(precondition.getFailureMessage() != null && !precondition.getFailureMessage().isBlank()) {
                    return Optional.of(precondition.getFailureMessage());
                }
                if(action.getDefaultFailureMessage() != null && !action.getDefaultFailureMessage().isEmpty()) {
                    return Optional.of(action.getDefaultFailureMessage());
                }
                return Optional.of("Non puoi compiere questa azione in questo momento.");
            }
        }

        return Optional.empty();
    }

    public boolean isSatisfied(GameSave save, Precondition precondition) {
        PreconditionType type = precondition.getType();
        String key = precondition.getRequiredKey();

        if (type == PreconditionType.HAS_ITEM) {
            return save.getInventory() != null && save.getInventory().contains(key);
        } else if (type == PreconditionType.DOES_NOT_HAVE_ITEM) {
            return save.getInventory() == null || !save.getInventory().contains(key);
        } else  if (type == PreconditionType.FLAG_EQUALS) {
            String val = save.getWorldFlags() != null ? save.getWorldFlags().get(key) : null;
            return Objects.equals(val, precondition.getExpectedValue());
        }
        return false;
    }
}
