package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.auth.RegisterRequest;
import com.jadventure.backend.dto.auth.UserDto;
import com.jadventure.backend.dto.user.UpdateProfileRequest;
import com.jadventure.backend.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDto toDto(User entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "bio", ignore = true)
    User toEntity(RegisterRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    void updateProfile(UpdateProfileRequest request, @MappingTarget User user);
}
