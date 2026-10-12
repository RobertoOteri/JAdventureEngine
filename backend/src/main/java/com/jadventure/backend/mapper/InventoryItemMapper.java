package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.inventory.InventoryItemDto;
import com.jadventure.backend.model.InventoryItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InventoryItemMapper {

    InventoryItemDto toDto(InventoryItem entity);

    List<InventoryItemDto> toDtoList(List<InventoryItem> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", source = "dto.code")
    @Mapping(target = "description", source = "dto.description")
    @Mapping(target = "graphicAdventure.id", source = "adventureDto.id")
    InventoryItem toEntity(InventoryItemDto dto, GraphicAdventureDto adventureDto);
}