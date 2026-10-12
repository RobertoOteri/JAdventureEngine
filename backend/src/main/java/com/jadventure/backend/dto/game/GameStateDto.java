package com.jadventure.backend.dto.game;

import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import lombok.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameStateDto {
    private String saveCode;
    private SceneDto currentScene;
    private List<InventoryItemDto> inventory;
    private Map<String, String> adventureFlags;
    private Set<String> visibleItemCodes;
}
