package com.jadventure.backend.dto.item;

import com.jadventure.backend.dto.action.ActionDto;
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
public class ItemDto {

    private Long id;

    @NotBlank(message = "Il codice dell'item è obbligatorio")
    @Size(max = 50, message = "Il codice dell'item non può superare i 50 caratteri")
    private String code;

    @NotBlank(message = "Il nome dell'item è obbligatorio")
    @Size(max = 100, message = "Il nome dell'item non può superare i 100 caratteri")
    private String name;

    @Size(max = 1000, message = "La descrizione non può superare i 1000 caratteri")
    private String description;

    private String imageUrl;

    private HotspotDto hotspot;

    @Builder.Default
    private List<ActionDto> actions = new ArrayList<>();
}