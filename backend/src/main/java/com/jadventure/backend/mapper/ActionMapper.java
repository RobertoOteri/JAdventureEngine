package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.model.Action;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PreconditionMapper.class, GameEffectMapper.class})
public interface ActionMapper {

    ActionDto toDto(Action entity);

    List<ActionDto> toDtoList(List<Action> entities);
}