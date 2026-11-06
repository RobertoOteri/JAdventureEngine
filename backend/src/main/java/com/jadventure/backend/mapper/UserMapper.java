package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.auth.RegisterRequest;
import com.jadventure.backend.dto.auth.UserDto;
import com.jadventure.backend.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDto toDto(User entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "bio", ignore = true)
    User toEntity(RegisterRequest request);
}
