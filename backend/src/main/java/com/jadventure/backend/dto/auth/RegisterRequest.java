package com.jadventure.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Il nome è obbligatorio")
    @Size(max = 50, message = "Il nome può contenere al massimo 50 caratteri")
    private String firstName;

    @NotBlank(message = "Il cognome è obbligatorio")
    @Size(max = 50, message = "Il cognome può contenere al massimo 50 caratteri")
    private String lastName;

    @NotBlank(message = "Lo username è obbligatorio")
    @Size(min = 3, max = 50, message = "Lo username deve contenere dai 3 ai 50 caratteri")
    @Pattern(regexp = "^[a-zA-Z0-9_.-]+$", message = "Lo username può contenere solo lettere, numeri e i caratteri _ . -")
    private String username;

    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Inserisci un indirizzo email valido")
    @Size(max = 255, message = "L'email può contenere al massimo 255 caratteri")
    private String email;

    @NotBlank(message = "La password è obbligatoria")
    @Size(min = 8, message = "La password deve contenere almeno 8 caratteri")
    private String password;
}
