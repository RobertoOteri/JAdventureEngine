package com.jadventure.backend.repository;

import com.jadventure.backend.model.Scene;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SceneRepository extends JpaRepository<Scene, Long> {

    List<Scene> findAllByGraphicAdventureCode(String adventureCode);

    Optional<Scene> findByGraphicAdventureCodeAndCode(String adventureCode, String code);
}
