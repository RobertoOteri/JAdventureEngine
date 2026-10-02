package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.model.GraphicAdventure;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GraphicAdventureMapper {

    @Mapping(target = "authorUsername", source = "author.username")
    GraphicAdventureDto toDto(GraphicAdventure entity);

    List<GraphicAdventureDto> toDtoList(List<GraphicAdventure> entities);
}
