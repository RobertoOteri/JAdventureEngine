package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.dialogue.DialogueChoiceDto;
import com.jadventure.backend.model.DialogueChoice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {PreconditionMapper.class, GameEffectMapper.class}
)
public interface DialogueChoiceMapper {

    @Mapping(source = "nextNode.code", target = "nextNodeCode")
    DialogueChoiceDto toDto(DialogueChoice entity);

    List<DialogueChoiceDto> toDtoList(List<DialogueChoice> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "nextNode", ignore = true)
    DialogueChoice toEntity(DialogueChoiceDto dto);
}
