package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.model.Item;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ActionMapper.class, InventoryItemMapper.class})
public interface ItemMapper {

    ItemDto toDto(Item entity);

    List<ItemDto> toDtoList(List<Item> entities);
}