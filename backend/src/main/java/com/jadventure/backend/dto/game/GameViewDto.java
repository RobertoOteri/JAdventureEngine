package com.jadventure.backend.dto.game;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameViewDto {

    private GameSceneDto currentScene;

    private List<GameItemDto> inventory;

    private String typedInput;

    private long playTime;

    private boolean completed;
}
