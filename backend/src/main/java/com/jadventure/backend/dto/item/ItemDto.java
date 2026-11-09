package com.jadventure.backend.dto.item;

import com.jadventure.backend.dto.action.ActionDto;
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

    @NotBlank(message = "{validation.item.code.required}")
    @Size(max = 50, message = "{validation.item.code.size}")
    private String code;

    @NotBlank(message = "{validation.item.name.required}")
    @Size(max = 100, message = "{validation.item.name.size}")
    private String name;

    @Size(max = 1000, message = "{validation.description.size}")
    private String description;

    private String imageUrl;

    private HotspotDto hotspot;

    @Builder.Default
    private List<ActionDto> actions = new ArrayList<>();
}