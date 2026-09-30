package com.jadventure.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {

    @NotBlank(message = "Lo username è obbligatorio")
    @Size(min = 3, max = 50, message = "Lo username deve contenere dai 3 ai 50 caratteri")
    @Pattern(regexp = "^[a-zA-Z0-9_.-]+$", message = "Lo username non può contenere spazi o caratteri speciali non ammessi")
    private String username;

    @NotBlank(message = "La password è obbligatoria")
    @Size(min = 4, message = "La password deve contenere almeno 4 caratteri")
    private String password;
}
