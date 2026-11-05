package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.action.ActionDto;
import com.jadventure.backend.model.Action;
import org.mapstruct.*;

import java.util.List;
import java.util.UUID;

@Mapper(
        componentModel = "spring",
        uses = {PreconditionMapper.class, GameEffectMapper.class},
        builder = @Builder(disableBuilder = true)
)
public interface ActionMapper {

    ActionDto toDto(Action entity);

    List<ActionDto> toDtoList(List<Action> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "item", ignore = true)
    void updateEntityFromDto(ActionDto dto, @MappingTarget Action entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "item", ignore = true)
    Action toEntity(ActionDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "item", ignore = true)
    Action copy(Action source, @Context AdventureCopyContext context);

    List<Action> copyList(List<Action> source, @Context AdventureCopyContext context);

    @AfterMapping
    default void afterMapping(@MappingTarget Action action) {
        if (action.getCode() == null || action.getCode().isBlank()) {
            action.setCode(UUID.randomUUID().toString());
        }

        if (action.getPreconditions() != null) {
            action.getPreconditions().forEach(p -> p.setAction(action));
        }

        if (action.getEffects() != null) {
            action.getEffects().forEach(e -> e.setAction(action));
        }
    }
}