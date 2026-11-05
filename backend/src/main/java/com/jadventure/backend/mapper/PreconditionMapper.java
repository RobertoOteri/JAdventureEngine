package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.action.PreconditionDto;
import com.jadventure.backend.dto.action.TextBoxDetailDto;
import com.jadventure.backend.model.Precondition;
import com.jadventure.backend.model.TextBoxDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PreconditionMapper {

    PreconditionDto toDto(Precondition entity);

    List<PreconditionDto> toDtoList(List<Precondition> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "action", ignore = true)
    Precondition toEntity(PreconditionDto dto);

    TextBoxDetailDto toDto(TextBoxDetail entity);

    TextBoxDetail toEntity(TextBoxDetailDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "action", ignore = true)
    Precondition copy(Precondition source);

    List<Precondition> copyList(List<Precondition> source);


    TextBoxDetail copy(TextBoxDetail source);
}