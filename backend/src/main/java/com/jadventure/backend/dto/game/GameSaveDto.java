package com.jadventure.backend.dto.game;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameSaveDto {
    private String code;
    private String name;
    private String currentSceneCode;
    private LocalDateTime savedAt;
}
