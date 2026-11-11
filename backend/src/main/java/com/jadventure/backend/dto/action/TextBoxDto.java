package com.jadventure.backend.dto.action;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TextBoxDto {

    @NotNull(message = "validation.textBox.invalid")
    @Min(value = 0, message = "validation.textBox.invalid")
    @Max(value = 1000, message = "validation.textBox.invalid")
    private Integer posX;

    @NotNull(message = "validation.textBox.invalid")
    @Min(value = 0, message = "validation.textBox.invalid")
    @Max(value = 1000, message = "validation.textBox.invalid")
    private Integer posY;

    @NotNull(message = "validation.textBox.invalid")
    @Min(value = 10, message = "validation.textBox.invalid")
    @Max(value = 1000, message = "validation.textBox.invalid")
    private Integer width;

    @NotNull(message = "validation.textBox.invalid")
    @Min(value = 10, message = "validation.textBox.invalid")
    @Max(value = 1000, message = "validation.textBox.invalid")
    private Integer height;

    @NotBlank(message = "validation.textBox.invalid")
    @Size(max = 100, message = "validation.textBox.invalid")
    private String fontFamily;

    @NotNull(message = "validation.textBox.invalid")
    @Min(value = 8, message = "validation.textBox.invalid")
    @Max(value = 96, message = "validation.textBox.invalid")
    private Integer fontSize;

    @NotBlank(message = "validation.textBox.invalid")
    @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "validation.textBox.invalid")
    private String color;
}