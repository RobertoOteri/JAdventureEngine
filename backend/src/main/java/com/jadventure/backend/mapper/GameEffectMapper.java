package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.action.GameEffectDto;
import com.jadventure.backend.dto.action.PreconditionDto;
import com.jadventure.backend.model.GameEffect;
import com.jadventure.backend.model.Precondition;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GameEffectMapper {

    GameEffectDto toDto(GameEffect entity);

    List<GameEffectDto> toDtoList(List<GameEffect> entities);

    GameEffect toEntity(GameEffectDto dto);

    List<GameEffect> toEntityList(List<GameEffectDto> dtos);
}