package com.jadventure.backend.mapper;

import com.jadventure.backend.dto.leaderboard.LeaderboardEntryDto;
import com.jadventure.backend.model.LeaderboardEntry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LeaderboardEntryMapper {

    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "avatarUrl", source = "user.avatarUrl")
    LeaderboardEntryDto toDto(LeaderboardEntry entity);

    List<LeaderboardEntryDto> toDtoList(List<LeaderboardEntry> entities);

}
