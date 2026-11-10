package com.jadventure.backend.service;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.GameEffect;
import com.jadventure.backend.model.enums.EffectType;
import com.jadventure.backend.service.effect.EffectHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Log4j2
public class GameEffectService {

    private final Map<EffectType, EffectHandler> handlers;

    public GameEffectService(List<EffectHandler> handlerList) {
        this.handlers = handlerList.stream()
                .collect(Collectors.toMap(EffectHandler::type, Function.identity()));
    }

    public void applyAll(Long adventureId, GameStateDto state, List<GameEffectDto> effects) {
        log.info("Executing applyAll with adventureId: {}, number of effects: {}", adventureId, effects != null ? effects.size() : 0);
        if (effects != null) {
            effects.forEach(effect -> apply(adventureId, state, effect));
        }
        log.info("Executed applyAll: currentScene: {}, completed: {}",
                state.getCurrentScene() != null ? state.getCurrentScene().getCode() : null, state.isCompleted());
    }

    public void apply(Long adventureId, GameStateDto state, GameEffectDto effect) {
        if (effect == null || effect.getType() == null) {
            log.debug("Skipping apply: effect or effect type is null");
            return;
        }
        log.debug("Executing apply with adventureId: {}, effect: {}", adventureId, effect);
        handlers.get(effect.getType()).apply(adventureId, state, effect);
        log.debug("Executed apply: effect {} applied", effect.getType());
    }
}
