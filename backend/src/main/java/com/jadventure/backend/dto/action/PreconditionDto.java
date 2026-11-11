package com.jadventure.backend.dto.action;

import com.jadventure.backend.model.enums.PreconditionType;
import jakarta.validation.Valid;
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

    @NotNull(message = "validation.precondition.type.required")
    private PreconditionType type;

    @NotBlank(message = "validation.precondition.key.required")
    private String requiredKey;

    private String expectedValue;
    private String failureMessage;

    @Valid
    private TextBoxDto textBox;
}