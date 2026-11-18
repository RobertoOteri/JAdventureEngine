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

    @NotBlank(message = "validation.item.code.required")
    private String itemCode;

    @NotNull(message = "validation.action.type.required")
    private ActionType actionType;

    private String targetItemCode;

    private String input;
}