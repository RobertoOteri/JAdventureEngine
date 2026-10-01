package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.adventure.GraphicAdventureResponse;
import com.jadventure.backend.model.GraphicAdventure;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GraphicAdventureMapper {

    @Mapping(target = "authorUsername", source = "author.username")
    GraphicAdventureResponse toResponse(GraphicAdventure entity);

    List<GraphicAdventureResponse> toResponseList(List<GraphicAdventure> entities);
}
