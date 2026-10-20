package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.game.GameStateDto;
import com.jadventure.backend.model.GameState;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {InventoryItemMapper.class})
public interface GameStateMapper {

    @Mapping(target = "currentScene.code", source = "currentSceneCode")
    GameStateDto toDto(GameState entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "currentSceneCode", source = "currentScene.code")
    GameState toEntity(GameStateDto dto);
}