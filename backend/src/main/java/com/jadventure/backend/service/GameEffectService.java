package com.jadventure.backend.service;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.GameEffect;
import com.jadventure.backend.model.enums.EffectType;
import com.jadventure.backend.service.effect.EffectHandler;
import lombok.RequiredArgsConstructor;
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
    }

    public void applyAll(Long adventureId, GameStateDto state, List<GameEffectDto> effects) {
        if (effects != null) {
            effects.forEach(effect -> apply(adventureId, state, effect));
        }
    }

    public void apply(Long adventureId, GameStateDto state, GameEffectDto effect) {
        if (effect == null || effect.getType() == null) {
            return;
        }
        handlers.get(effect.getType()).apply(adventureId, state, effect);
    }
}