package com.jadventure.backend.repository;

import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.enums.AdventureStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface GraphicAdventureRepository extends JpaRepository <GraphicAdventure, Long> {

    List<GraphicAdventure> findAllByAuthorUsernameAndStatusOrderByCreatedAtDesc(String username, AdventureStatus status);

    List<GraphicAdventure> findAllByStatusOrderByCodeAscVersionNumberDesc(AdventureStatus status);

    List<GraphicAdventure> findAllByCodeAndStatusOrderByVersionNumberDesc(String code, AdventureStatus status);

    List<GraphicAdventure> findAllByCode(String code);

    boolean existsByCode(String code);

    boolean existsByTitle(String title);

    boolean existsByTitleAndCodeNot(String title, String code);

    List<GraphicAdventure> findAllByCodeInAndStatusOrderByCodeAscVersionNumberDesc(Collection<String> codes, AdventureStatus status);

    boolean existsByCodeAndStatus(String code, AdventureStatus status);
}
