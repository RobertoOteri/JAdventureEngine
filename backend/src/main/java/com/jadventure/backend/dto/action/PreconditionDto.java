package com.jadventure.backend.dto.action;

import com.jadventure.backend.model.enums.PreconditionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreconditionDto {
    private Long id;

    @NotNull(message = "Il tipo di precondizione è obbligatorio")
    private PreconditionType type;

    @NotBlank(message = "La chiave richiesta è obbligatoria")
    private String requiredKey;

    private String expectedValue;
    private String failureMessage;

    private TextBoxDetailDto textBoxDetail;
}