package com.jadventure.backend.repository;

import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.model.Scene;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findAllByGraphicAdventureCode(String adventureCode);

    List<Item> findAllByGraphicAdventureCodeAndCodeIn(String adventureCode, Collection<String> codes);

}
