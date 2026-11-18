package com.jadventure.backend.dto.game;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameSaveDto {
    private Long id;
    private String code;
    private String name;
    private Long adventureId;
    private LocalDateTime savedAt;
    private GameViewDto gameState;
}