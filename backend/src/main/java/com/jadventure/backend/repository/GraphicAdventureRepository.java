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

    Optional<GraphicAdventure> findByCode(String code);

    boolean existsByCode(String code);
}
