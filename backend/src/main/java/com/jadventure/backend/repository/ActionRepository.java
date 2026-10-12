package com.jadventure.backend.repository;

import com.jadventure.backend.model.Action;
import com.jadventure.backend.model.enums.ActionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActionRepository extends JpaRepository<Action, Long> {

    boolean existsByItemCodeAndType(String itemCode, ActionType type);

    List<Action> findAllByItemCode(String itemCode);

    Optional<Action> findByCode(String code);

    boolean existsByItemCodeAndCode(String itemCode, String code);

    Optional<Action> findByItemCodeAndType(String itemCode, ActionType type);
}
