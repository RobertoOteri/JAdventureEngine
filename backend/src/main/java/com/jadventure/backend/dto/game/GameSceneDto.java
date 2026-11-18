package com.jadventure.backend.dto.game;

import com.jadventure.backend.dto.action.TextBoxDto;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameSceneDto {

    private String code;

    private String name;

    private String backgroundImageUrl;

    private TextBoxDto keypadBox;

    private List<GameItemDto> items;
}
