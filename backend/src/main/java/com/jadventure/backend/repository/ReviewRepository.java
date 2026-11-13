package com.jadventure.backend.repository;

import com.jadventure.backend.model.Review;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @EntityGraph(attributePaths = {"user", "graphicAdventure"})
    List<Review> findAllByGraphicAdventureCodeOrderByUpdatedAtDesc(String adventureCode, Pageable pageable);

    List<Review> findAllByGraphicAdventureCode(String adventureCode);

    @EntityGraph(attributePaths = "graphicAdventure")
    List<Review> findAllByGraphicAdventureCodeIn(Collection<String> adventureCodes);

    @EntityGraph(attributePaths = {"user", "graphicAdventure"})
    Optional<Review> findByUserUsernameAndGraphicAdventureCode(String username, String adventureCode);

    long countByUserUsername(String username);
}
