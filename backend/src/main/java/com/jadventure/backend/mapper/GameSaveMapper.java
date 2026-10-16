package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.model.GameSave;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GameSaveMapper {

    GameSaveDto toDto(GameSave entity);

    List<GameSaveDto> toDtoList(List<GameSave> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", source = "dto.code")
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "graphicAdventure.id", source = "adventureDto.id")
    @Mapping(target = "graphicAdventure.code", source = "adventureDto.code")
    @Mapping(target = "inventory", ignore = true)
    @Mapping(target = "adventureFlags", ignore = true)
    @Mapping(target = "visibleItems", ignore = true)
    GameSave toEntity(GameSaveDto dto, GraphicAdventureDto adventureDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "graphicAdventure", ignore = true)
    @Mapping(target = "inventory", ignore = true)
    @Mapping(target = "adventureFlags", ignore = true)
    @Mapping(target = "visibleItems", ignore = true)
    GameSave toEntity(GameSaveDto dto);
}