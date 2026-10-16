package com.jadventure.backend.repository;

import com.jadventure.backend.model.Action;
import com.jadventure.backend.model.enums.ActionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActionRepository extends JpaRepository<Action, Long> {

    List<Action> findAllByItemId(Long itemId);

    Optional<Action> findByCode(String code);

}
