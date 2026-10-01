package com.jadventure.backend.repository;

import com.jadventure.backend.model.GraphicAdventure;
import org.springframework.boot.autoconfigure.data.ConditionalOnRepositoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GraphicAdventureRepository extends JpaRepository <GraphicAdventure, Long> {

    List<GraphicAdventure> findAllByAuthorUsernameOrderByCreatedAtDesc(String username);

    // Per accedere al dettaglio o editare solo se l'avventura appartiene a chi è loggato
    Optional<GraphicAdventure> findByCodeAndAuthorUsername(String code, String username);

    Optional<GraphicAdventure> findByCode(String code);

    // Controlli di unicità in creazione/modifica
    boolean existsByCode(String code);
    boolean existsByTitleIgnoreCase(String title);
}
