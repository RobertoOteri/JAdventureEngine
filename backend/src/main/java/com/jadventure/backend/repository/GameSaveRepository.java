package com.jadventure.backend.repository;

import com.jadventure.backend.model.GameSave;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface GameSaveRepository extends JpaRepository<GameSave, Long> {

    Optional<GameSave> findByCodeAndUserUsername(String code, String username);

    Optional<GameSave> findFirstByUserUsernameAndGraphicAdventureIdAndAutoSaveTrue(String username, Long adventureId);

    Optional<GameSave> findFirstByUserUsernameAndGraphicAdventureIdOrderBySavedAtDesc(String username, Long adventureId);

    List<GameSave> findAllByUserUsernameAndGraphicAdventureIdOrderBySavedAtDesc(String username, Long adventureId);

    void deleteAllByUserUsernameAndGraphicAdventureId(String username, Long adventureId);

    boolean existsByUserUsernameAndGraphicAdventureCode(String username, String adventureCode);
}