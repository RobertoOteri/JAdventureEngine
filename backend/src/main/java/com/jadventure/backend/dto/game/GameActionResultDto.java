package com.jadventure.backend.dto.game;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameActionResultDto {
    private boolean success;
    private String feedbackMessage;
    private GameStateDto state;
}
