package com.jadventure.backend.dto.action;

import com.jadventure.backend.model.enums.ActionType;
import jakarta.validation.Valid;
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

    @Size(max = 255, message = "validation.action.code.size")
    private String code;

    @NotNull(message = "validation.action.type.required")
    private ActionType type;

    private String successMessage;
    private String defaultFailureMessage;

    private String targetItemCode;

    @Valid
    @Builder.Default
    private List<PreconditionDto> preconditions = new ArrayList<>();

    @Valid
    @Builder.Default
    private List<GameEffectDto> effects = new ArrayList<>();
}