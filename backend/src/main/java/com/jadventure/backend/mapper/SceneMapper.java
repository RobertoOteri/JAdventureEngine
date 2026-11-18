package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.game.GameSceneDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.model.Scene;
import org.mapstruct.BeanMapping;
import org.mapstruct.Builder;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ItemMapper.class})
public interface SceneMapper {

    SceneDto toDto(Scene entity);

    List<SceneDto> toDtoList(List<Scene> entities);

    @Mapping(target = "keypadBox", ignore = true)
    @Mapping(target = "items", ignore = true)
    GameSceneDto toGameDto(SceneDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "graphicAdventure", ignore = true)
    @Mapping(target = "items", ignore = true)
    Scene toEntity(SceneDto dto);

    @BeanMapping(builder = @Builder(disableBuilder = true))
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "graphicAdventure", ignore = true)
    Scene copy(Scene source, @Context AdventureCopyContext context);

    List<Scene> copyList(List<Scene> source, @Context AdventureCopyContext context);
}