package com.jadventure.backend.dto.item;

import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotspotDto {

    @Size(max = 1000, message = "I punti non possono superare i 1000 caratteri")

    private String points;
    private Integer posX;
    private Integer posY;
    private Integer width;
    private Integer height;

    @Builder.Default
    private Boolean initiallyVisible = true;
}
