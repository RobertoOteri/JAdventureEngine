package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import com.jadventure.backend.service.InventoryItemService;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class AddItemEffectHandler implements EffectHandler {

    private final InventoryItemService inventoryItemService;

    public AddItemEffectHandler(InventoryItemService inventoryItemService) {
        this.inventoryItemService = inventoryItemService;
    }

    @Override
    public EffectType type() {
        return EffectType.ADD_ITEM;
    }

    @Override
    public void apply(String adventureCode, GameStateDto state, String itemCode) {
        boolean alreadyOwned = state.getInventory().stream()
                .anyMatch(item -> item.getCode().equals(itemCode));
        if (alreadyOwned) {
            return;
        }

        inventoryItemService.loadPlayerInventory(adventureCode, Set.of(itemCode))
                .stream()
                .findFirst()
                .ifPresent(state.getInventory()::add);
    }
}
