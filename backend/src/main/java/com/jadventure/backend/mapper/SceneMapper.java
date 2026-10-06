package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.model.Scene;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ItemMapper.class})
public interface SceneMapper {

    SceneDto toDto(Scene entity);

    List<SceneDto> toDtoList(List<Scene> entities);
}