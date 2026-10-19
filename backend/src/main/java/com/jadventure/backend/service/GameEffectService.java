package com.jadventure.backend.service;

import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.model.GameEffect;
import com.jadventure.backend.model.enums.EffectType;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GameEffectService {

    private final SceneService sceneService;
    private final InventoryItemService inventoryItemService;

    public GameEffectService(SceneService sceneService, InventoryItemService inventoryItemService) {
        this.sceneService = sceneService;
        this.inventoryItemService = inventoryItemService;
    }

    public void applyAll(String adventureCode, GameStateDto state, List<GameEffect> effects) {
        if (effects == null || effects.isEmpty()) {
            return;
        }

        for (GameEffect effect : effects) {
            apply(adventureCode, state, effect);
        }
    }

    public void apply(String adventureCode, GameStateDto state, GameEffect effect) {
        if (effect == null || effect.getType() == null) {
            return;
        }

        if (effect.getType() == EffectType.END_ADVENTURE) {
            state.setCompleted(true);
            return;
        }

        String val = effect.getTargetValue();
        if (val == null || val.isBlank()) {
            return;
        }
        val = val.trim();

        switch (effect.getType()) {
            case CHANGE_SCENE    -> changeScene(adventureCode, state, val);
            case ADD_ITEM        -> addItem(adventureCode, state, val);
            case REMOVE_ITEM     -> removeItem(state, val);
            case SET_FLAG        -> setFlag(state, val);
            case SHOW_SCENE_ITEM -> showSceneItem(state, val);
            case HIDE_SCENE_ITEM -> hideSceneItem(state, val);
        }
    }

    private void changeScene(String adventureCode, GameStateDto state, String targetSceneCode) {
        SceneDto targetScene = sceneService.getSceneByCode(adventureCode, targetSceneCode);
        state.setCurrentScene(targetScene);

        if (state.getVisibleItemCodes() == null) {
            state.setVisibleItemCodes(new HashSet<>());
        }

        if (targetScene != null && targetScene.getItems() != null) {
            Set<String> inventoryCodes = state.getInventory() == null ? new HashSet<>() :
                    state.getInventory().stream().map(InventoryItemDto::getCode).collect(Collectors.toSet());

            Set<String> sceneInitialVisible = targetScene.getItems().stream()
                    .filter(ItemDto::isInitiallyVisible)
                    .map(ItemDto::getCode)
                    .filter(code -> !inventoryCodes.contains(code))
                    .collect(Collectors.toSet());

            state.getVisibleItemCodes().addAll(sceneInitialVisible);
        }
    }

    private void addItem(String adventureCode, GameStateDto state, String itemCode) {
        if (state.getInventory() == null) {
            state.setInventory(new ArrayList<>());
        }
        boolean exists = state.getInventory().stream().anyMatch(i -> i.getCode().equals(itemCode));
        if (!exists) {
            InventoryItemDto itemDto = inventoryItemService.loadPlayerInventory(adventureCode, Set.of(itemCode))
                    .stream().findFirst().orElse(null);
            if (itemDto != null) {
                state.getInventory().add(itemDto);
            }
        }
    }

    private void removeItem(GameStateDto state, String itemCode) {
        if (state.getInventory() != null) {
            state.getInventory().removeIf(i -> i.getCode().equals(itemCode));
        }
    }

    private void setFlag(GameStateDto state, String rawFlag) {
        if (state.getAdventureFlags() == null) {
            state.setAdventureFlags(new HashMap<>());
        }
        String[] parts = rawFlag.split("=", 2);
        String flagKey = parts[0].trim();
        String flagValue = parts.length > 1 ? parts[1].trim() : "true";
        state.getAdventureFlags().put(flagKey, flagValue);
    }

    private void showSceneItem(GameStateDto state, String itemCode) {
        if (state.getVisibleItemCodes() == null) {
            state.setVisibleItemCodes(new HashSet<>());
        }
        state.getVisibleItemCodes().add(itemCode);
    }

    private void hideSceneItem(GameStateDto state, String itemCode) {
        if (state.getVisibleItemCodes() != null) {
            state.getVisibleItemCodes().remove(itemCode);
        }
    }
}