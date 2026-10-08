package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.game.GameSaveDto;
import com.jadventure.backend.model.GameSave;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GameSaveMapper {

    GameSaveDto toDto(GameSave entity);

    List<GameSaveDto> toDtoList(List<GameSave> entities);
}
