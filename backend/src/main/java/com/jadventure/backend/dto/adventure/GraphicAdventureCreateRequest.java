package com.jadventure.backend.dto.adventure;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GraphicAdventureCreateRequest {

    @NotBlank(message = "Il titolo è obbligatorio")
    @Size(min = 3, max = 100, message = "Il titolo deve essere compreso tra 3 e 100 caratteri")
    private String title;

    @Size(max = 2000, message = "La descrizione non può superare i 2000 caratteri")
    private String description;

    private String coverImageUrl;
}
