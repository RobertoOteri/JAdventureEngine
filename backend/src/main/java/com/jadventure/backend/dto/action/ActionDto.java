package com.jadventure.backend.dto.action;

import com.jadventure.backend.model.enums.ActionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActionDto {

    private Long id;

    @Size(max = 255, message = "Il codice non può superare i 255 caratteri")
    private String code;

    @NotNull(message = "Il tipo d'azione è obbligatorio")
    private ActionType type;

    private String successMessage;
    private String defaultFailureMessage;

    private String withInventoryItemCode;

    @Builder.Default
    private List<PreconditionDto> preconditions = new ArrayList<>();

    @Builder.Default
    private List<GameEffectDto> effects = new ArrayList<>();
}