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
public class GameEffectDto {
    private Long id;

    @NotBlank(message = "Il tipo di effetto è obbligatorio")
    private String type;

    private String targetValue;
}