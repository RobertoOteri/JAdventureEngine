package com.jadventure.backend.service;

import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.model.GameEffect;
import com.jadventure.backend.model.GameSave;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GameEffectService {

    private final SceneService sceneService;

    public GameEffectService(SceneService sceneService) {
        this.sceneService = sceneService;
    }

    public void applyAll(GameSave save, List<GameEffect> effects) {
        if (effects == null || effects.isEmpty()) {
            return;
        }
        for (GameEffect effect : effects) {
            apply(save, effect);
        }
    }

    public void apply(GameSave save, GameEffect effect) {
        if (effect == null || effect.getType() == null) {
            return;
        }

        String val = effect.getTargetValue();
        if (val == null || val.isBlank()) {
            return;
        }
        val = val.trim();

        switch (effect.getType()) {
            case CHANGE_SCENE    -> changeScene(save, val);
            case ADD_ITEM        -> addItem(save, val);
            case REMOVE_ITEM     -> removeItem(save, val);
            case SET_FLAG        -> setFlag(save, val);
            case SHOW_SCENE_ITEM -> showSceneItem(save, val);
            case HIDE_SCENE_ITEM -> hideSceneItem(save, val);
        }
    }

    private void changeScene(GameSave save, String targetSceneCode) {
        save.setCurrentSceneCode(targetSceneCode);

        if (save.getVisibleItems() == null) {
            save.setVisibleItems(new HashSet<>());
        }

        String adventureCode = save.getGraphicAdventure().getCode();
        SceneDto targetScene = sceneService.getSceneByCode(adventureCode, targetSceneCode);

        if (targetScene != null && targetScene.getItems() != null) {
            Set<String> sceneInitialVisible = targetScene.getItems().stream()
                    .filter(ItemDto::isInitiallyVisible)
                    .map(ItemDto::getCode)
                    .filter(code -> save.getInventory() == null || !save.getInventory().contains(code))
                    .collect(Collectors.toSet());

            save.getVisibleItems().addAll(sceneInitialVisible);
        }
    }

    private void addItem(GameSave save, String itemCode) {
        if (save.getInventory() == null) {
            save.setInventory(new HashSet<>());
        }
        save.getInventory().add(itemCode);
    }

    private void removeItem(GameSave save, String itemCode) {
        if (save.getInventory() != null) {
            save.getInventory().remove(itemCode);
        }
    }

    private void setFlag(GameSave save, String rawFlag) {
        if (save.getAdventureFlags() == null) {
            save.setAdventureFlags(new HashMap<>());
        }
        String[] parts = rawFlag.split("=", 2);
        String flagKey = parts[0].trim();
        String flagValue = parts.length > 1 ? parts[1].trim() : "true";
        save.getAdventureFlags().put(flagKey, flagValue);
    }

    private void showSceneItem(GameSave save, String itemCode) {
        if (save.getVisibleItems() == null) {
            save.setVisibleItems(new HashSet<>());
        }
        save.getVisibleItems().add(itemCode);
    }

    private void hideSceneItem(GameSave save, String itemCode) {
        if (save.getVisibleItems() != null) {
            save.getVisibleItems().remove(itemCode);
        }
    }
}