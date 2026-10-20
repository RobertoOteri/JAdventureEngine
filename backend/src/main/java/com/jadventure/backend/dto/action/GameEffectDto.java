package com.jadventure.backend.dto.action;

import com.jadventure.backend.model.enums.EffectType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameEffectDto {
    private Long id;

    @NotNull(message = "Il tipo di effetto è obbligatorio")
    private EffectType type;

    private String targetValue;

    private String flagValue;
}