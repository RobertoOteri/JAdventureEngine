package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.model.InventoryItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InventoryItemMapper {

    InventoryItemDto toDto(InventoryItem entity);

    List<InventoryItemDto> toDtoList(List<InventoryItem> entities);

    @Mapping(target = "graphicAdventure", ignore = true)
    InventoryItem toEntity(InventoryItemDto dto);
}