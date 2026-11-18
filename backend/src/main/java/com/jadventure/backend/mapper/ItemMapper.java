package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.game.GameItemDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.model.Hotspot;
import com.jadventure.backend.model.Item;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ActionMapper.class, DialogueNodeMapper.class})
public interface ItemMapper {

    ItemDto toDto(Item entity);

    List<ItemDto> toDtoList(List<Item> entities);

    GameItemDto toGameDto(ItemDto dto);

    @Mapping(target = "graphicAdventure", ignore = true)
    @Mapping(target = "actions", ignore = true)
    @Mapping(target = "dialogueNodes", ignore = true)
    Item toEntity(ItemDto dto);

    @BeanMapping(builder = @Builder(disableBuilder = true))
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "graphicAdventure", ignore = true)
    Item copy(Item source, @Context AdventureCopyContext context);

    List<Item> copyList(List<Item> source, @Context AdventureCopyContext context);

    Hotspot copy(Hotspot source);

    @AfterMapping
    default void linkChildren(@MappingTarget Item item, @Context AdventureCopyContext context) {
        item.getActions().forEach(action -> action.setItem(item));
        item.getDialogueNodes().forEach(node -> node.setItem(item));
    }
}