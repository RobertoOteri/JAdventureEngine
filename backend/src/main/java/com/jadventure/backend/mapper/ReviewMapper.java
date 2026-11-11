package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.review.ReviewDto;
import com.jadventure.backend.model.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "adventureId", source = "graphicAdventure.id")
    @Mapping(target = "versionNumber", source = "graphicAdventure.versionNumber")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "avatarUrl", source = "user.avatarUrl")
    @Mapping(target = "completed", ignore = true)
    ReviewDto toDto(Review entity);
}