package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.model.enums.EffectType;
import com.jadventure.backend.service.SceneService;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@Log4j2
public class ChangeSceneEffectHandler implements EffectHandler{

    private final SceneService sceneService;

    public ChangeSceneEffectHandler(SceneService sceneService) {
        this.sceneService = sceneService;
    }

    @Override
    public EffectType type() {
        return EffectType.CHANGE_SCENE;
    }

    @Override
    public void apply(Long adventureId, GameStateDto state, GameEffectDto effect) {
        log.info("Executing CHANGE_SCENE effect with adventureId: {}, effect: {}", adventureId, effect);
        SceneDto scene = sceneService.getSceneByCode(adventureId, effect.getTargetValue());
        state.setCurrentScene(scene);

        if (scene == null || scene.getItems() == null) {
            log.info("Executed CHANGE_SCENE effect: current scene changed to {}, no items to show", effect.getTargetValue());
            return;
        }

        Set<String> inventoryCodes = state.getInventory().stream()
                .map(ItemDto::getCode)
                .collect(Collectors.toSet());

        scene.getItems().stream()
                .filter(item -> item.getHotspot() != null && Boolean.TRUE.equals(item.getHotspot().getInitiallyVisible()))
                .map(ItemDto::getCode)
                .filter(code -> !inventoryCodes.contains(code))
                .forEach(state.getVisibleItemCodes()::add);
        log.info("Executed CHANGE_SCENE effect: current scene changed to {}, {} visible items", scene.getCode(), state.getVisibleItemCodes().size());
    }
}