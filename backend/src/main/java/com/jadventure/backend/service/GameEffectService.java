package com.jadventure.backend.service;

import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.GameEffect;
import com.jadventure.backend.model.enums.EffectType;
import com.jadventure.backend.service.effect.EffectHandler;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GameEffectService {

    private final Map<EffectType, EffectHandler> handlers;

    public GameEffectService(List<EffectHandler> handlerList) {
        this.handlers = handlerList.stream()
                .collect(Collectors.toMap(EffectHandler::type, Function.identity()));

        for (EffectType type : EffectType.values()) {
            if (!handlers.containsKey(type)) {
                throw new IllegalStateException("Manca l'handler per l'effetto " + type);
            }
        }
    }

    public void applyAll(String adventureCode, GameStateDto state, List<GameEffect> effects) {
        if (effects != null) {
            effects.forEach(effect -> apply(adventureCode, state, effect));
        }
    }

    public void apply(String adventureCode, GameStateDto state, GameEffect effect) {
        if (effect == null || effect.getType() == null) {
            return;
        }

        EffectHandler handler = handlers.get(effect.getType());
        String value = effect.getTargetValue() == null ? "" : effect.getTargetValue().trim();

        if (value.isEmpty() && handler.requiresValue()) {
            return;
        }
        handler.apply(adventureCode, state, value);
    }
}