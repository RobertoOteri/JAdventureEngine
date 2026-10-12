package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.model.Scene;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ItemMapper.class})
public interface SceneMapper {

    SceneDto toDto(Scene entity);

    List<SceneDto> toDtoList(List<Scene> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", source = "dto.code")
    @Mapping(target = "graphicAdventure.id", source = "adventureDto.id")
    @Mapping(target = "graphicAdventure.code", source = "adventureDto.code")
    @Mapping(target = "items", ignore = true)
    Scene toEntity(SceneDto dto, GraphicAdventureDto adventureDto);
}