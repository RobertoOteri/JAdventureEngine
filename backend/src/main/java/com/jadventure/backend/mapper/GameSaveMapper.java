package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.model.GameSave;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {GameStateMapper.class})
public interface GameSaveMapper {

    @Mapping(target = "adventureId", source = "graphicAdventure.id")
    GameSaveDto toDto(GameSave entity);

    List<GameSaveDto> toDtoList(List<GameSave> entities);
}