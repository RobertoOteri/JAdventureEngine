package com.jadventure.backend.service;

import com.jadventure.backend.model.GameEffect;
import com.jadventure.backend.model.GameSave;
import com.jadventure.backend.model.enums.EffectType;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

@Service
public class GameEffectService {

    public void applyAll(GameSave save, List<GameEffect> effects) {
        if (effects == null || effects.isEmpty()) {
            return;
        }
        for (GameEffect effect : effects) {
            apply(save, effect);
        }
    }

    public void apply(GameSave save, GameEffect effect) {
        EffectType type = effect.getType();
        String val = effect.getTargetValue();

        if (val == null || val.isBlank()) {
            return;
        }

        val = val.trim();

        if (type == EffectType.CHANGE_SCENE) {
            save.setCurrentSceneCode(val);
        } else if (type == EffectType.ADD_ITEM) {
            if (save.getInventory() == null) save.setInventory(new HashSet<>());
            save.getInventory().add(val);
        } else if (type == EffectType.REMOVE_ITEM) {
            if (save.getInventory() != null) save.getInventory().remove(val);
        } else if (type == EffectType.SET_FLAG) {
            if (save.getAdventureFlags() == null) save.setAdventureFlags(new HashMap<>());
            String[] parts = val.split("=", 2);
            String flagKey = parts[0].trim();
            String flagValue = parts.length > 1 ? parts[1].trim() : "true";
            save.getAdventureFlags().put(flagKey, flagValue);
        } else if (type == EffectType.SHOW_SCENE_ITEM) {
            if (save.getVisibleItems() == null) save.setVisibleItems(new HashSet<>());
            save.getVisibleItems().add(val);
        } else if (type == EffectType.HIDE_SCENE_ITEM) {
            if (save.getVisibleItems() != null) save.getVisibleItems().remove(val);
        }
    }
}