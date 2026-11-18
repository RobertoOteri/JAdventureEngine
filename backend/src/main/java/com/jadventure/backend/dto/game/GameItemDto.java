package com.jadventure.backend.dto.game;

import com.jadventure.backend.dto.item.HotspotDto;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameItemDto {

    private String code;

    private String name;

    private String description;

    private String imageUrl;

    private HotspotDto hotspot;

    private List<GameItemActionDto> actions;
}
