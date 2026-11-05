package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.model.enums.EffectType;
import com.jadventure.backend.service.SceneService;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
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
        SceneDto scene = sceneService.getSceneByCode(adventureId, effect.getTargetValue());
        state.setCurrentScene(scene);

        if (scene == null || scene.getItems() == null) {
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
    }
}