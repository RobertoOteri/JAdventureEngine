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

        if(val == null || val.isBlank()) {
            return;
        }

        if (type == EffectType.CHANGE_SCENE) {
            save.setCurrentSceneCode(val);
        } else if (type == EffectType.ADD_ITEM) {
            if (save.getInventory() == null) save.setInventory(new HashSet<>());
            save.getInventory().add(val);
        } else if (type == EffectType.REMOVE_ITEM) {
            if (save.getInventory() != null) save.getInventory().remove(val);
        } else if (type == EffectType.SET_FLAG) {
            if (save.getWorldFlags() == null) save.setWorldFlags(new HashMap<>());
            String[] parts = val.split("=", 2);
            save.getWorldFlags().put(parts[0], parts.length > 1 ? parts[1] : "true");
        } else if (type == EffectType.SHOW_SCENE_ITEM) {
            if (save.getVisibleSceneItems() == null) save.setVisibleSceneItems(new HashSet<>());
            save.getVisibleSceneItems().add(val);
        } else if (type == EffectType.HIDE_SCENE_ITEM) {
            if (save.getVisibleSceneItems() != null) save.getVisibleSceneItems().remove(val);
        }
    }
}
