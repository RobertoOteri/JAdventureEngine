package com.jadventure.backend.dto.inventory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemDto {

    private Long id;

    @NotBlank(message = "Il codice dell'oggetto dell'inventario è obbligatorio")
    @Size(max = 50, message = "Il codice non può superare i 50 caratteri")
    private String code;

    @NotBlank(message = "Il nome dell'oggetto inventario è obbligatorio")
    @Size(max = 100, message = "Il nome non può superare i 100 caratteri")
    private String name;

    @Size(max = 1000, message = "La descrizione non può superare i 1000 caratteri")
    private String description;

    private String imageUrl;
}