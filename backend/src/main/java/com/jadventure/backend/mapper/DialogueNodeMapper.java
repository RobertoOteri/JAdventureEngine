package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.dialogue.DialogueNodeDto;
import com.jadventure.backend.model.DialogueNode;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {DialogueChoiceMapper.class, GameEffectMapper.class}
)
public interface DialogueNodeMapper {

    DialogueNodeDto toDto(DialogueNode entity);

    List<DialogueNodeDto> toDtoList (List<DialogueNode> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "item", ignore = true)
    DialogueNode toEntity(DialogueNodeDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "item", ignore = true)
    void updateEntity(DialogueNodeDto dto, @MappingTarget DialogueNode node);
}
