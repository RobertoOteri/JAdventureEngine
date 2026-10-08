package com.jadventure.backend.repository;

import com.jadventure.backend.model.GameSave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameSaveRepository extends JpaRepository<GameSave, Long> {

    Optional<GameSave> findByCodeAndUserUsername(String code, String username);

    Optional<GameSave> findFirstByUserUsernameAndGraphicAdventureCodeOrderBySavedAtDesc(
            String username,
            String adventureCode
    );

    List<GameSave> findAllByUserUsernameAndGraphicAdventureCodeOrderBySavedAtDesc(
            String username,
            String adventureCode
    );

    void deleteAllByUserUsernameAndGraphicAdventureCode(String username, String code);
}
