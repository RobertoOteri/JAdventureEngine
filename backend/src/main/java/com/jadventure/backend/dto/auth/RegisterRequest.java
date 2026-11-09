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

    @NotBlank(message = "{validation.firstName.required}")
    @Size(max = 50, message = "{validation.firstName.size}")
    private String firstName;

    @NotBlank(message = "{validation.lastName.required}")
    @Size(max = 50, message = "{validation.lastName.size}")
    private String lastName;
    @NotBlank(message = "{validation.username.required}")
    @Size(min = 3, max = 50, message = "{validation.username.size}")
    @Pattern(regexp = "^[a-zA-Z0-9_.-]+$", message = "{validation.username.pattern}")
    private String username;

    @NotBlank(message = "{validation.email.required}")
    @Email(message = "{validation.email.invalid}")
    @Size(max = 255, message = "{validation.email.size}")
    private String email;

    @NotBlank(message = "{validation.password.required}")
    @Size(min = 8, message = "{validation.password.size}")
    private String password;
}
