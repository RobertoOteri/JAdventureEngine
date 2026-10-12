package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.model.Action;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PreconditionMapper.class, GameEffectMapper.class})
public interface ActionMapper {

    ActionDto toDto(Action entity);

    List<ActionDto> toDtoList(List<Action> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", source = "dto.code")
    @Mapping(target = "item.id", source = "itemDto.id")
    Action toEntity(ActionDto dto, ItemDto itemDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "item", ignore = true)
    Action toEntity(ActionDto dto);
}