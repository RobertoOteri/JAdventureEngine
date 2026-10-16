package com.jadventure.backend.repository;

import com.jadventure.backend.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findAllByGraphicAdventureCode(String adventureCode);

    Optional<InventoryItem> findByGraphicAdventureCodeAndCode(String adventureCode, String code);

    boolean existsByGraphicAdventureCodeAndCode(String adventureCode, String code);

    List<InventoryItem> findAllByGraphicAdventureCodeAndCodeIn(String graphicAdventureCode, Set<String> codes);
}
