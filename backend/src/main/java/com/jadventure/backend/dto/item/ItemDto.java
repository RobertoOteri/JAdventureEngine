package com.jadventure.backend.dto.item;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.inventory.InventoryItemDto;
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

    private String imageUrl;
    private Integer posX;
    private Integer posY;

    @NotBlank(message = "I punti dell'area interattiva sono obbligatori")
    @Size(max = 1000, message = "I punti non possono superare i 1000 caratteri")
    private String points;

    private Integer width;
    private Integer height;

    @Builder.Default
    private boolean initiallyVisible = true;

    private InventoryItemDto linkedInventoryItem;

    @Builder.Default
    private List<ActionDto> actions = new ArrayList<>();
}