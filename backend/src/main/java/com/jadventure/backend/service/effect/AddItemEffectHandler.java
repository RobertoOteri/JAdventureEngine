package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import com.jadventure.backend.service.ItemService;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class AddItemEffectHandler implements EffectHandler {

    private final ItemService itemService;

    public AddItemEffectHandler(ItemService itemService) {
        this.itemService = itemService;
    }

    @Override
    public EffectType type() {
        return EffectType.ADD_ITEM;
    }

    @Override
    public void apply(Long adventureId, GameStateDto state, GameEffectDto effect) {
        String itemCode = effect.getTargetValue();
        boolean alreadyOwned = state.getInventory().stream()
                .anyMatch(item -> item.getCode().equals(itemCode));
        if (alreadyOwned) {
            return;
        }

        itemService.loadPlayerInventory(adventureId, Set.of(itemCode))
                .stream()
                .findFirst()
                .ifPresent(state.getInventory()::add);
    }
}