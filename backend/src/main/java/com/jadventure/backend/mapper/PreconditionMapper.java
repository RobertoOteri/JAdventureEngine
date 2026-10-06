package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.action.PreconditionDto;
import com.jadventure.backend.model.Precondition;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PreconditionMapper {

    PreconditionDto toDto(Precondition entity);

    List<PreconditionDto> toDtoList(List<Precondition> entities);

    Precondition toEntity(PreconditionDto dto);

    List<Precondition> toEntityList(List<PreconditionDto> dtos);
}