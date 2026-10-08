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

    @NotBlank
    private String itemCode;

    @NotNull
    private ActionType actionType;
}
