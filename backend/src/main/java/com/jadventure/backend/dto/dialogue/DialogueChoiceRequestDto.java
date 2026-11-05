package com.jadventure.backend.dto.dialogue;

import com.jadventure.backend.dto.game.GameStateDto;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DialogueChoiceRequestDto {

    @NotNull
    private Long adventureId;

    @NotNull
    private GameStateDto gameState;

    @NotNull
    private Long choiceId;
}
