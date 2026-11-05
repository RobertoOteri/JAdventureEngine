package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.model.GraphicAdventure;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = {SceneMapper.class, ItemMapper.class})
public interface GraphicAdventureMapper {

    @Mapping(target = "authorUsername", source = "author.username")
    GraphicAdventureDto toDto(GraphicAdventure entity);

    List<GraphicAdventureDto> toDtoList(List<GraphicAdventure> entities);

    @Mapping(target = "author", ignore = true)
    GraphicAdventure toEntity(GraphicAdventureDto dto);

    @BeanMapping(builder = @Builder(disableBuilder = true))
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "versionNumber", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "saves", ignore = true)
    GraphicAdventure copy(GraphicAdventure source, @Context AdventureCopyContext context);

    @AfterMapping
    default void linkChildren(@MappingTarget GraphicAdventure adventure, @Context AdventureCopyContext context) {
        adventure.getScenes().forEach(scene -> scene.setGraphicAdventure(adventure));
        adventure.getItems().forEach(item -> item.setGraphicAdventure(adventure));
    }

}