package com.jadventure.backend.dto.game;

import com.jadventure.backend.model.enums.ActionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameActionDto {

    @NotNull(message = "validation.adventure.id.required")
    private Long adventureId;

    @NotNull(message = "validation.gameState.required")
    private GameStateDto gameState;

    @NotBlank(message = "validation.action.code.required")
    private String actionCode;

    @NotNull(message = "validation.action.type.required")
    private ActionType actionType;

    private String input;
}