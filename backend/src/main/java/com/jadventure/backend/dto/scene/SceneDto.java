package com.jadventure.backend.dto.scene;

import com.jadventure.backend.dto.item.ItemDto;
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
public class SceneDto {

    private Long id;

    @NotBlank(message = "{validation.scene.code.required}")
    @Size(max = 50, message = "{validation.scene.code.size}")
    private String code;

    @NotBlank(message = "{validation.scene.name.required}")
    @Size(max = 100, message = "{validation.scene.name.size}")
    private String name;

    private String backgroundImageUrl;

    @Builder.Default
    private List<ItemDto> items = new ArrayList<>();
}