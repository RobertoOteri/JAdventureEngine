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

    @NotBlank(message = "Il codice del salvataggio è obbligatorio")
    private String saveCode;

    @NotBlank(message = "Il codice dell'azione è obbligatorio")
    private String actionCode;

    @NotNull(message = "Il tipo di azione è obbligatorio")
    private ActionType actionType;
}
