package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.dto.inventory.InventoryItemDto;
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
    public void apply(String adventureCode, GameStateDto state, GameEffectDto effect) {
        SceneDto scene = sceneService.getSceneByCode(adventureCode, effect.getTargetValue());
        state.setCurrentScene(scene);

        if (scene == null || scene.getItems() == null) {
            return;
        }

        Set<String> inventoryCodes = state.getInventory().stream()
                .map(InventoryItemDto::getCode)
                .collect(Collectors.toSet());

        scene.getItems().stream()
                .filter(ItemDto::isInitiallyVisible)
                .map(ItemDto::getCode)
                .filter(code -> !inventoryCodes.contains(code))
                .forEach(state.getVisibleItemCodes()::add);
    }

}
