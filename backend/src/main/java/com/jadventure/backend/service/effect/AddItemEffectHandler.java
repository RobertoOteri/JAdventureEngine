package com.jadventure.backend.service.effect;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.enums.EffectType;
import com.jadventure.backend.service.ItemService;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@Log4j2
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
        log.info("Executing ADD_ITEM effect with adventureId: {}, effect: {}", adventureId, effect);
        String itemCode = effect.getTargetValue();
        boolean alreadyOwned = state.getInventory().stream()
                .anyMatch(item -> item.getCode().equals(itemCode));
        if (alreadyOwned) {
            log.info("Executed ADD_ITEM effect: item {} already in inventory, nothing to do", itemCode);
            return;
        }

        itemService.loadPlayerInventory(adventureId, Set.of(itemCode))
                .stream()
                .findFirst()
                .ifPresent(state.getInventory()::add);
        log.info("Executed ADD_ITEM effect: inventory now contains {} items", state.getInventory().size());
    }
}