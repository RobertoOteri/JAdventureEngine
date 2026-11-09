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

    @NotBlank(message = "validation.firstName.required")
    @Size(max = 50, message = "validation.firstName.size")
    private String firstName;

    @NotBlank(message = "validation.lastName.required")
    @Size(max = 50, message = "validation.lastName.size")
    private String lastName;

    @NotBlank(message = "validation.email.required")
    @Email(message = "validation.email.invalid")
    @Size(max = 255, message = "validation.email.size")
    private String email;

    @Size(max = 500, message = "validation.bio.size")
    private String bio;
}
