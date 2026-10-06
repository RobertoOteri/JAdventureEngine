package com.jadventure.backend.dto.action;

import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "Il tipo di precondizione è obbligatorio")
    private String type;

    @NotBlank(message = "La chiave richiesta è obbligatoria")
    private String requiredKey;

    private String expectedValue;
    private String failureMessage;
}