package com.jadventure.backend.repository;

import com.jadventure.backend.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {


    List<Item> findAllBySceneCode(String sceneCode);

    boolean existsBySceneCodeAndCode(String sceneCode, String code);


    Optional<Item> findBySceneGraphicAdventureCodeAndSceneCodeAndCode(
            String adventureCode,
            String sceneCode,
            String itemCode
    );
}
