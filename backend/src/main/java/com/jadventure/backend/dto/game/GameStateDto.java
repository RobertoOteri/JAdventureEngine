package com.jadventure.backend.dto.game;

import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import lombok.*;

import java.util.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameStateDto {
    private SceneDto currentScene;

    @Builder.Default
    private List<InventoryItemDto> inventory = new ArrayList<>();

    @Builder.Default
    private Map<String, String> adventureFlags = new HashMap<>();

    @Builder.Default
    private Set<String> visibleItemCodes = new HashSet<>();

    private boolean completed;
}
