package com.jadventure.backend.dto.dialogue;

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
    private Long choiceId;
}
