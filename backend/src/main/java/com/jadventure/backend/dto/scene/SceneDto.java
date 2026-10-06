package com.jadventure.backend.dto.scene;

import com.jadventure.backend.dto.item.ItemDto;
import jakarta.validation.constraints.NotBlank;
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
public class SceneDto {

    @NotBlank(message = "Il codice della scena è obbligatorio")
    @Size(max = 50, message = "Il codice della scena non può superare i 50 caratteri")
    private String code;

    @NotBlank(message = "Il nome della scena è obbligatorio")
    @Size(max = 100, message  = "Il nome della scena non può superare i 100 caratteri")
    private String name;

    private String backgroundImageUrl;

    private boolean setAsInitial;

    @Builder.Default
    private List<ItemDto> items = new ArrayList<>();
}


