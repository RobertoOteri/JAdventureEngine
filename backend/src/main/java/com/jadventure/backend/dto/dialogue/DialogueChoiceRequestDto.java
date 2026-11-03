package com.jadventure.backend.dto.dialogue;

import com.jadventure.backend.dto.game.GameStateDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DialogueChoiceRequestDto {

    @NotBlank
    private String adventureCode;

    @NotNull
    private GameStateDto gameState;

    @NotNull
    private Long choiceId;
}
