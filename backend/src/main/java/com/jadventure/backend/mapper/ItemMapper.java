package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.model.Item;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ActionMapper.class})
public interface ItemMapper {

    ItemDto toDto(Item entity);

    List<ItemDto> toDtoList(List<Item> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "scene", ignore = true)
    @Mapping(target = "actions", ignore = true)
    @Mapping(target = "linkedInventoryItem", ignore = true)
    Item toEntity(ItemDto dto);
}