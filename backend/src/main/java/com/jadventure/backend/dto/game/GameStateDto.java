package com.jadventure.backend.dto.game;

import com.jadventure.backend.dto.item.ItemDto;
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
    private List<ItemDto> inventory = new ArrayList<>();

    @Builder.Default
    private Map<String, String> adventureFlags = new HashMap<>();

    @Builder.Default
    private Set<String> visibleItemCodes = new HashSet<>();

    @Builder.Default
    private long playTime = 0;

    private boolean completed;

    private String currentDialogueNodeCode;
}