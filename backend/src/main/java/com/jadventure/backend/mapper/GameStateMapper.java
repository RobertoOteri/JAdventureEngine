package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.dto.game.GameViewDto;
import com.jadventure.backend.model.GameState;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ItemMapper.class})
public interface GameStateMapper {

    @Mapping(target = "currentScene.code", source = "currentSceneCode")
    GameStateDto toDto(GameState entity);

    @Mapping(target = "currentScene", ignore = true)
    @Mapping(target = "typedInput", ignore = true)
    GameViewDto toViewDto(GameStateDto dto);
}