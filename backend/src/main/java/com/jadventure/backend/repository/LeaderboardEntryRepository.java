package com.jadventure.backend.repository;

import com.jadventure.backend.model.LeaderboardEntry;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface LeaderboardEntryRepository extends JpaRepository<LeaderboardEntry, Long> {

    boolean existsByUserUsernameAndGraphicAdventureId(String username, Long adventureId);

    @EntityGraph(attributePaths = "user")
    List<LeaderboardEntry> findTop15ByGraphicAdventureIdOrderByPlayTimeAscCompletedAtAsc(Long adventureId);

    boolean existsByUserUsernameAndGraphicAdventureCode(String username, String adventureCode);

    @EntityGraph(attributePaths = "user")
    List<LeaderboardEntry> findAllByGraphicAdventureCodeAndUserUsernameIn(String adventureCode, Collection<String> usernames);

    @EntityGraph(attributePaths = "graphicAdventure")
    List<LeaderboardEntry> findAllByUserUsername(String username);

}