package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.model.GameEffect;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GameEffectMapper {

    GameEffectDto toDto(GameEffect entity);

    List<GameEffectDto> toDtoList(List<GameEffect> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "action", ignore = true)
    GameEffect toEntity(GameEffectDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "action", ignore = true)
    GameEffect copy(GameEffect source);

    List<GameEffect> copyList(List<GameEffect> source);
}