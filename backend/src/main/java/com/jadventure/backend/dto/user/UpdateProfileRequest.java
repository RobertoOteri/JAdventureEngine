package com.jadventure.backend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = "Il nome è obbligatorio")
    @Size(max = 50, message = "Il nome può contenere al massimo 50 caratteri")
    private String firstName;

    @NotBlank(message = "Il cognome è obbligatorio")
    @Size(max = 50, message = "Il cognome può contenere al massimo 50 caratteri")
    private String lastName;

    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Inserisci un indirizzo email valido")
    @Size(max = 255, message = "L'email può contenere al massimo 255 caratteri")
    private String email;

    @Size(max = 500, message = "La biografia può contenere al massimo 500 caratteri")
    private String bio;
}
