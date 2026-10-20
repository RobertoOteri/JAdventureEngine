package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.model.GameSave;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {GameStateMapper.class})
public interface GameSaveMapper {

    GameSaveDto toDto(GameSave entity);

    List<GameSaveDto> toDtoList(List<GameSave> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", source = "dto.code")
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "graphicAdventure", ignore = true)
    @Mapping(target = "gameState", source = "dto.gameState")
    GameSave toEntity(GameSaveDto dto);
}